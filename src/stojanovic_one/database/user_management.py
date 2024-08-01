# src/stojanovic_one/database/user_management.py

import sqlite3
from sqlite3 import Connection
import bcrypt
from stojanovic_one.auth.jwt_utils import generate_token
from typing import Optional

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
    

def login_user(conn: Connection, username: str, password: str) -> Optional[str]:
    """
    Authenticate a user and generate a JWT token if successful.

    Args:
        conn (Connection): An active SQLite database connection.
        username (str): The user's username.
        password (str): The user's password.

    Returns:
        Optional[str]: JWT token if authentication was successful, None otherwise.
    """
    cursor = conn.cursor()

    # Fetch the user's hashed password
    cursor.execute("SELECT password_hash FROM users WHERE username = ?", (username,))
    result = cursor.fetchone()

    if result is None:
        return None  # User not found

    stored_password = result[0]

    # Check if the provided password matches the stored hash
    if bcrypt.checkpw(password.encode('utf-8'), stored_password):
        return generate_token(username)
    else:
        return None