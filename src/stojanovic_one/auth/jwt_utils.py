# src/stojanovic_one/auth/jwt_utils.py

import jwt
import uuid
from datetime import datetime, timedelta
from typing import Dict, Optional

SECRET_KEY = "your-secret-key"
ALGORITHM = "HS256"

# We'll use this set to store invalidated tokens
invalidated_tokens = set()

def generate_token(username: str, expiration: int = 3600) -> str:
    """
    Generate a JWT token for a user.

    Args:
        username (str): The username to include in the token payload.
        expiration (int): Token expiration time in seconds. Default is 1 hour.

    Returns:
        str: The generated JWT token.
    """
    payload = {
        "sub": username,
        "exp": datetime.utcnow() + timedelta(seconds=expiration),
        "iat": datetime.utcnow(),
        "jti": str(uuid.uuid4()),  # Unique identifier for the token
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def validate_token(token: str) -> Optional[Dict]:
    """
    Validate a JWT token.

    Args:
        token (str): The JWT token to validate.

    Returns:
        Optional[Dict]: The token payload if valid, None otherwise.
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if token in invalidated_tokens:
            return None  # Token has been invalidated (logged out)
        return payload
    except jwt.PyJWTError:
        return None  # Token is invalid or expired

def invalidate_token(token: str) -> bool:
    """
    Invalidate a JWT token by adding it to the set of invalidated tokens.

    Args:
        token (str): The JWT token to invalidate.

    Returns:
        bool: True if the token was successfully invalidated, False otherwise.
    """
    try:
        jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])  # Verify the token is valid
        if token in invalidated_tokens:
            return False  # Token is already invalidated
        invalidated_tokens.add(token)
        return True
    except jwt.PyJWTError:
        return False  # Token is already invalid or expired