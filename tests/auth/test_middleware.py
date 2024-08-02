# tests/auth/test_middleware.py

import pytest
from PySide6.QtCore import QObject
from stojanovic_one.auth.middleware import JWTMiddleware, protect_route
from stojanovic_one.auth.jwt_utils import generate_token

class MockMainWindow(QObject):
    def __init__(self):
        super().__init__()
        self.current_token = None

    @protect_route
    def protected_method(self):
        return "Protected method called"

def test_jwt_middleware_valid_token():
    middleware = JWTMiddleware()
    token = generate_token("testuser")
    assert middleware.check_auth(token) == True

def test_jwt_middleware_invalid_token():
    middleware = JWTMiddleware()
    assert middleware.check_auth("invalid_token") == False

def test_jwt_middleware_no_token():
    middleware = JWTMiddleware()
    assert middleware.check_auth(None) == False

def test_protect_route_decorator():
    mock_window = MockMainWindow()
    
    # Test with no token
    result = mock_window.protected_method()
    assert result is None

    # Test with valid token
    mock_window.current_token = generate_token("testuser")
    result = mock_window.protected_method()
    assert result == "Protected method called"

    # Test with invalid token
    mock_window.current_token = "invalid_token"
    result = mock_window.protected_method()
    assert result is None