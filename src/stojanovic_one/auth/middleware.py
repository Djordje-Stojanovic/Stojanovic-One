# src/stojanovic_one/auth/middleware.py

from PySide6.QtCore import QObject, Signal
from stojanovic_one.auth.jwt_utils import validate_token

class JWTMiddleware(QObject):
    authentication_failed = Signal()

    def __init__(self):
        super().__init__()

    def check_auth(self, token):
        """
        Check if the provided token is valid.

        Args:
            token (str): The JWT token to validate.

        Returns:
            bool: True if the token is valid, False otherwise.
        """
        if token is None:
            self.authentication_failed.emit()
            return False

        payload = validate_token(token)
        if payload is None:
            self.authentication_failed.emit()
            return False

        return True

def protect_route(func):
    """
    Decorator to protect routes that require authentication.

    Usage:
    @protect_route
    def some_protected_method(self):
        # Protected method implementation
    """
    def wrapper(self, *args, **kwargs):
        if not hasattr(self, 'current_token') or not self.current_token:
            print("Authentication required")
            return
        
        middleware = JWTMiddleware()
        if middleware.check_auth(self.current_token):
            return func(self, *args, **kwargs)
        else:
            print("Authentication failed")
    
    return wrapper