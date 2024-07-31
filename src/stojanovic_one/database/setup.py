# src/stojanovic_one/database/setup.py

import sqlite3
from sqlite3 import Connection

def initialize_database(db_path: str) -> Connection:
    conn = sqlite3.connect(db_path)
    return conn

def create_user_table(conn: Connection) -> None:
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