# src/stojanovic_one/database/setup.py

import sqlite3
from sqlite3 import Connection

def initialize_database(db_path: str) -> Connection:
    """
    Initialize a SQLite database connection and create the users table if it doesn't exist.

    Args:
        db_path (str): Path to the SQLite database file or ':memory:' for in-memory database.

    Returns:
        Connection: A SQLite database connection object.
    """
    conn = sqlite3.connect(db_path)
    create_user_table(conn)
    return conn

def create_user_table(conn: Connection) -> None:
    """
    Create the users table if it doesn't exist.

    Args:
        conn (Connection): An active SQLite database connection.
    """
    cursor = conn.cursor()
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    conn.commit()