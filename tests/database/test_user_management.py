# tests/database/test_user_management.py

import pytest
import sqlite3
from stojanovic_one.database.setup import initialize_database, create_user_table
from stojanovic_one.database.user_management import register_user

@pytest.fixture
def db_connection():
    """
    Pytest fixture to create a temporary in-memory SQLite database for testing.
    This fixture is used by all test functions to ensure a clean database state for each test.
    """
    conn = initialize_database(':memory:')
    create_user_table(conn)
    yield conn
    conn.close()

def test_register_user_success(db_connection):
    """
    Test successful user registration.
    
    This test verifies that a user can be successfully registered
    when provided with valid username, email, and password.
    """
    assert register_user(db_connection, "testuser", "test@example.com", "password123")

def test_register_user_duplicate(db_connection):
    """
    Test duplicate user registration attempts.
    
    This test ensures that:
    1. The first user registration is successful.
    2. A second registration with the same username fails.
    3. A second registration with the same email fails.
    """
    register_user(db_connection, "testuser", "test@example.com", "password123")
    assert not register_user(db_connection, "testuser", "another@example.com", "password456")
    assert not register_user(db_connection, "anotheruser", "test@example.com", "password789")

def test_register_user_invalid_input(db_connection):
    """
    Test user registration with invalid input.
    
    This test verifies that:
    1. Attempting to register with an empty username raises an IntegrityError.
    2. Attempting to register with an empty email raises an IntegrityError.
    """
    with pytest.raises(sqlite3.IntegrityError):
        register_user(db_connection, "", "test@example.com", "password123")
    with pytest.raises(sqlite3.IntegrityError):
        register_user(db_connection, "testuser", "", "password123")

def test_password_hashing(db_connection):
    """
    Test password hashing functionality.
    
    This test ensures that:
    1. The password is not stored in plain text.
    2. The stored password hash starts with the bcrypt prefix ($2b$),
       indicating that it has been properly hashed.
    """
    register_user(db_connection, "testuser", "test@example.com", "password123")
    cursor = db_connection.cursor()
    cursor.execute("SELECT password_hash FROM users WHERE username = ?", ("testuser",))
    hashed_password = cursor.fetchone()[0]
    assert hashed_password != "password123"
    assert hashed_password.startswith(b'$2b$')  # bcrypt hash prefix