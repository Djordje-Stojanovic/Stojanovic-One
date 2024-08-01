# src/stojanovic_one/ui/login_form.py

from PySide6.QtWidgets import QWidget, QVBoxLayout, QLineEdit, QPushButton, QLabel
from PySide6.QtCore import Slot

class LoginForm(QWidget):
    """
    A widget that provides a user login form.

    This form includes input fields for username and password,
    as well as a login button and a message label for feedback.
    """

    def __init__(self, login_user_func=None):
        super().__init__()

        self.login_user_func = login_user_func or self._default_login_user

        self.setWindowTitle("User Login")
        self.setGeometry(100, 100, 300, 200)

        layout = QVBoxLayout()

        self.username_input = QLineEdit()
        self.username_input.setPlaceholderText("Username")
        layout.addWidget(self.username_input)

        self.password_input = QLineEdit()
        self.password_input.setPlaceholderText("Password")
        self.password_input.setEchoMode(QLineEdit.Password)
        layout.addWidget(self.password_input)

        self.login_button = QPushButton("Login")
        self.login_button.setEnabled(False)
        layout.addWidget(self.login_button)

        self.message_label = QLabel()
        layout.addWidget(self.message_label)

        self.setLayout(layout)

        # Connect signals
        self.username_input.textChanged.connect(self.validate_input)
        self.password_input.textChanged.connect(self.validate_input)
        self.login_button.clicked.connect(self.login_user)

    @Slot()
    def validate_input(self):
        """
        Validate the input fields and enable/disable the login button accordingly.
        """
        if self.username_input.text() and self.password_input.text():
            self.login_button.setEnabled(True)
        else:
            self.login_button.setEnabled(False)

    @Slot()
    def login_user(self):
        """
        Handle the user login process when the login button is clicked.
        """
        username = self.username_input.text()
        password = self.password_input.text()

        result = self.login_user_func(username, password)

        if result:
            self.message_label.setText("Login successful!")
        else:
            self.message_label.setText("Login failed. Please try again.")

    def _default_login_user(self, username: str, password: str) -> bool:
        """
        Default user login function.

        Args:
            username (str): The user's username.
            password (str): The user's password.

        Returns:
            bool: True if login was successful, False otherwise.
        """
        # This is a placeholder. We'll implement the actual login logic later.
        return False