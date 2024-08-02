# src/stojanovic_one/ui/login_form.py

from PySide6.QtWidgets import QWidget, QVBoxLayout, QLineEdit, QPushButton, QLabel
from PySide6.QtCore import Slot, Signal

class LoginForm(QWidget):
    login_successful = Signal(str, str)

    def __init__(self, login_user_func):
        super().__init__()
        self.login_user_func = login_user_func
        self.token = None
        
        layout = QVBoxLayout()
        
        self.username_input = QLineEdit()
        self.username_input.setPlaceholderText("Username")
        layout.addWidget(self.username_input)
        
        self.password_input = QLineEdit()
        self.password_input.setPlaceholderText("Password")
        self.password_input.setEchoMode(QLineEdit.Password)
        layout.addWidget(self.password_input)
        
        self.login_button = QPushButton("Login")
        self.login_button.clicked.connect(self.login_user)
        layout.addWidget(self.login_button)
        
        self.message_label = QLabel()
        layout.addWidget(self.message_label)
        
        self.setLayout(layout)

    @Slot()
    def login_user(self):
        username = self.username_input.text()
        password = self.password_input.text()
        
        success = self.login_user_func(username, password)
        
        if success:
            self.message_label.setText("Login successful!")
            self.login_successful.emit(username, password)
        else:
            self.message_label.setText("Login failed. Please try again.")