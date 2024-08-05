# src/stojanovic_one/ui/logout_form.py

from PySide6.QtWidgets import QWidget, QVBoxLayout, QPushButton, QLabel
from PySide6.QtCore import Slot, Signal
from typing import Callable, Optional

class LogoutForm(QWidget):
    logout_successful = Signal()

    def __init__(self, logout_user_func: Callable = None, token: Optional[str] = None):
        super().__init__()
        self.logout_user_func = logout_user_func or self._default_logout_user
        self.token = token

        self.setWindowTitle("User Logout")
        self.setGeometry(100, 100, 300, 200)

        layout = QVBoxLayout()

        self.logout_button = QPushButton("Logout")
        layout.addWidget(self.logout_button)

        self.message_label = QLabel()
        layout.addWidget(self.message_label)

        self.setLayout(layout)

        # Connect signals
        self.logout_button.clicked.connect(self.logout_user)

    def set_token(self, token: str):
        """Set the token for the logout form."""
        self.token = token

    @Slot()
    def logout_user(self):
        if self.token is None:
            self.message_label.setText("No active session. Please log in first.")
            return

        result = self.logout_user_func(self.token)

        if result:
            self.message_label.setText("Logout successful!")
            self.token = None
            self.logout_successful.emit()
        else:
            self.message_label.setText("Logout failed. Please try again.")

    def _default_logout_user(self, token: str) -> bool:
        """
        Default user logout function.

        Args:
            token (str): The authentication token to invalidate.

        Returns:
            bool: True if logout was successful, False otherwise.
        """
        # This is a placeholder. We'll implement the actual logout logic later.
        return False