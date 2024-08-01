# tests/auth/test_jwt_utils.py

import pytest
from stojanovic_one.auth.jwt_utils import generate_token, validate_token
from datetime import datetime, timedelta

def test_generate_token():
    """
    Test that a token can be generated successfully.
    """
    username = "testuser"
    token = generate_token(username)
    assert isinstance(token, str)
    assert len(token) > 0

def test_validate_token():
    """
    Test that a generated token can be validated successfully.
    """
    username = "testuser"
    token = generate_token(username)
    payload = validate_token(token)
    assert payload is not None
    assert payload['sub'] == username

def test_validate_expired_token():
    """
    Test that an expired token is not validated.
    """
    import jwt
    username = "testuser"
    payload = {
        "sub": username,
        "exp": datetime.utcnow() - timedelta(hours=1),  # Token expired 1 hour ago
        "iat": datetime.utcnow() - timedelta(hours=2),
    }
    expired_token = jwt.encode(payload, "your-secret-key", algorithm="HS256")
    assert validate_token(expired_token) is None

def test_validate_invalid_token():
    """
    Test that an invalid token is not validated.
    """
    invalid_token = "invalid.token.string"
    assert validate_token(invalid_token) is None