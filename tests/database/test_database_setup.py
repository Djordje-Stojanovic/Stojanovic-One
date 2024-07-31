# tests/database/test_database_setup.py

import pytest
import sqlite3
from stojanovic_one.database.setup import initialize_database, create_user_table

def test_initialize_database():
    conn = initialize_database(':memory:')
    assert isinstance(conn, sqlite3.Connection)
    assert conn.total_changes == 0
    conn.close()

def test_create_user_table():
    conn = initialize_database(':memory:')
    create_user_table(conn)
    cursor = conn.cursor()
    
    # Check if the users table exists
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='users'")
    assert cursor.fetchone() is not None

    # Check the schema of the users table
    cursor.execute("PRAGMA table_info(users)")
    columns = cursor.fetchall()
    expected_columns = [
        (0, 'id', 'INTEGER', 0, None, 1),
        (1, 'username', 'TEXT', 1, None, 0),
        (2, 'email', 'TEXT', 1, None, 0),
        (3, 'password_hash', 'TEXT', 1, None, 0),
        (4, 'created_at', 'TIMESTAMP', 0, 'CURRENT_TIMESTAMP', 0)  # Updated this line
    ]
    assert columns == expected_columns
    
    conn.close()

def test_database_connection_error():
    with pytest.raises(sqlite3.OperationalError):
        initialize_database('/nonexistent/path/database.db')