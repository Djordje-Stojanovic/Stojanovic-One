# tests/database/test_user_management.py

import pytest
import sqlite3
from stojanovic_one.database.setup import initialize_database, create_user_table
from stojanovic_one.database.user_management import register_user, login_user, logout_user

@pytest.fixture(scope="function")
def db_connection():
    conn = initialize_database(':memory:')
    create_user_table(conn)
    yield conn
    conn.close()

def test_register_user_success(db_connection):
    assert register_user(db_connection, "testuser", "test@example.com", "password123")

def test_register_user_duplicate(db_connection):
    register_user(db_connection, "testuser", "test@example.com", "password123")
    assert not register_user(db_connection, "testuser", "another@example.com", "password456")
    assert not register_user(db_connection, "anotheruser", "test@example.com", "password789")

def test_register_user_invalid_input(db_connection):
    with pytest.raises(sqlite3.IntegrityError):
        register_user(db_connection, "", "test@example.com", "password123")
    with pytest.raises(sqlite3.IntegrityError):
        register_user(db_connection, "testuser", "", "password123")

def test_password_hashing(db_connection):
    register_user(db_connection, "testuser", "test@example.com", "password123")
    cursor = db_connection.cursor()
    cursor.execute("SELECT password_hash FROM users WHERE username = ?", ("testuser",))
    hashed_password = cursor.fetchone()[0]
    assert hashed_password != "password123"
    assert hashed_password.startswith(b'$2b$')

def test_login_user_success(db_connection):
    register_user(db_connection, "testuser", "test@example.com", "password123")
    token = login_user(db_connection, "testuser", "password123")
    assert token is not None
    assert isinstance(token, str)

def test_login_user_wrong_password(db_connection):
    register_user(db_connection, "testuser", "test@example.com", "password123")
    token = login_user(db_connection, "testuser", "wrongpassword")
    assert token is None

def test_login_user_nonexistent(db_connection):
    token = login_user(db_connection, "nonexistent", "password123")
    assert token is None

def test_logout_user_success(db_connection):
    register_user(db_connection, "testuser", "test@example.com", "password123")
    token = login_user(db_connection, "testuser", "password123")
    assert token is not None
    assert logout_user(token)

def test_logout_user_invalid_token():
    assert not logout_user("invalid_token")

def test_logout_user_already_logged_out(db_connection):
    register_user(db_connection, "testuser", "test@example.com", "password123")
    token = login_user(db_connection, "testuser", "password123")
    assert token is not None
    assert logout_user(token)
    assert not logout_user(token)