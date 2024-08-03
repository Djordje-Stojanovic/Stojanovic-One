# src/stojanovic_one/auth/middleware.py

import functools
from PySide6.QtCore import QObject, Signal
from stojanovic_one.auth.jwt_utils import validate_token

class JWTMiddleware(QObject):
    authentication_failed = Signal()

    def __init__(self):
        super().__init__()

    def check_auth(self, token):
        if token is None:
            self.authentication_failed.emit()
            return False

        payload = validate_token(token)
        if payload is None:
            self.authentication_failed.emit()
            return False

        return True

def protect_route(func):
    @functools.wraps(func)
    def wrapper(self, *args, **kwargs):
        if not hasattr(self, 'current_token') or not self.current_token:
            print("Authentication required")
            if hasattr(self, 'jwt_middleware'):
                self.jwt_middleware.authentication_failed.emit()
            return

        if hasattr(self, 'jwt_middleware'):
            middleware = self.jwt_middleware
        else:
            middleware = JWTMiddleware()

        if middleware.check_auth(self.current_token):
            return func(self, *args, **kwargs)
        else:
            print("Authentication failed")
            middleware.authentication_failed.emit()

    return wrapper