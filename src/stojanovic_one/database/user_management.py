# src/stojanovic_one/database/user_management.py

import sqlite3
from sqlite3 import Connection
import bcrypt

def register_user(conn: Connection, username: str, email: str, password: str) -> bool:
    """
    Register a new user in the database.

    Args:
        conn (Connection): An active SQLite database connection.
        username (str): The user's chosen username.
        email (str): The user's email address.
        password (str): The user's password (will be hashed before storage).

    Returns:
        bool: True if registration was successful, False otherwise.

    Raises:
        sqlite3.IntegrityError: If username or email is empty.
    """
    if not username or not email:
        raise sqlite3.IntegrityError("Username and email cannot be empty")

    cursor = conn.cursor()

    # Check if username or email already exists
    cursor.execute("SELECT * FROM users WHERE username = ? OR email = ?", (username, email))
    if cursor.fetchone() is not None:
        return False  # User already exists

    # Hash the password
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

    # Insert the new user
    try:
        cursor.execute(
            "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)",
            (username, email, hashed_password)
        )
        conn.commit()
        return True
    except sqlite3.Error:
        conn.rollback()
        return False