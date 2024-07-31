# tests/database/test_user_management.py

import pytest
import sqlite3
from stojanovic_one.database.setup import initialize_database, create_user_table
from stojanovic_one.database.user_management import register_user

@pytest.fixture
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
    assert hashed_password.startswith(b'$2b$')  # bcrypt hash prefix