# src/stojanovic_one/auth/jwt_utils.py

import jwt
from datetime import datetime, timedelta
from typing import Dict, Optional

# This should be a secure, randomly generated key in a real application
# In production, this should be stored securely and not in the source code
SECRET_KEY = "your-secret-key"
ALGORITHM = "HS256"

def generate_token(username: str) -> str:
    """
    Generate a JWT token for a user.

    Args:
        username (str): The username to include in the token payload.

    Returns:
        str: The generated JWT token.
    """
    payload = {
        "sub": username,
        "exp": datetime.utcnow() + timedelta(hours=1),  # Token expires in 1 hour
        "iat": datetime.utcnow(),
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
        return payload
    except jwt.PyJWTError:
        return None