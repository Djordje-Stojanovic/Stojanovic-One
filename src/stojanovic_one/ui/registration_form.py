# src/stojanovic_one/ui/registration_form.py

from PySide6.QtWidgets import QWidget, QVBoxLayout, QLineEdit, QPushButton, QLabel
from PySide6.QtCore import Slot
from stojanovic_one.database.setup import initialize_database
from typing import Callable

class RegistrationForm(QWidget):
    """
    A widget that provides a user registration form.

    This form includes input fields for username, email, and password,
    as well as a register button and a message label for feedback.

    Args:
        register_user_func (Callable, optional): A function to handle user registration.
            If not provided, a default function will be used.
    """

    def __init__(self, register_user_func: Callable = None):
        super().__init__()

        self.register_user_func = register_user_func or self._default_register_user

        self.setWindowTitle("User Registration")
        self.setGeometry(100, 100, 300, 200)

        layout = QVBoxLayout()

        self.username_input = QLineEdit()
        self.username_input.setPlaceholderText("Username")
        layout.addWidget(self.username_input)

        self.email_input = QLineEdit()
        self.email_input.setPlaceholderText("Email")
        layout.addWidget(self.email_input)

        self.password_input = QLineEdit()
        self.password_input.setPlaceholderText("Password")
        self.password_input.setEchoMode(QLineEdit.Password)
        layout.addWidget(self.password_input)

        self.register_button = QPushButton("Register")
        self.register_button.setEnabled(False)
        layout.addWidget(self.register_button)

        self.message_label = QLabel()
        layout.addWidget(self.message_label)

        self.setLayout(layout)

        # Connect signals
        self.username_input.textChanged.connect(self.validate_input)
        self.email_input.textChanged.connect(self.validate_input)
        self.password_input.textChanged.connect(self.validate_input)
        self.register_button.clicked.connect(self.register_user)

    @Slot()
    def validate_input(self):
        """
        Validate the input fields and enable/disable the register button accordingly.
        """
        if self.username_input.text() and self.email_input.text() and self.password_input.text():
            self.register_button.setEnabled(True)
        else:
            self.register_button.setEnabled(False)

    @Slot()
    def register_user(self):
        """
        Handle the user registration process when the register button is clicked.
        """
        print("register_user method called")  # Debug print
        username = self.username_input.text()
        email = self.email_input.text()
        password = self.password_input.text()

        print(f"Registering user: {username}, {email}")  # Debug print

        result = self.register_user_func(username, email, password)
        print(f"Registration result: {result}")  # Debug print

        if result:
            self.message_label.setText("Registration successful!")
        else:
            self.message_label.setText("Registration failed. Please try again.")

    def _default_register_user(self, username: str, email: str, password: str) -> bool:
        """
        Default user registration function.

        Args:
            username (str): The user's chosen username.
            email (str): The user's email address.
            password (str): The user's password.

        Returns:
            bool: True if registration was successful, False otherwise.
        """
        conn = initialize_database('users.db')
        from stojanovic_one.database.user_management import register_user
        result = register_user(conn, username, email, password)
        conn.close()
        return result