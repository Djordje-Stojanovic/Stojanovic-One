# src/stojanovic_one/ui/registration_form.py

from PySide6.QtWidgets import QWidget, QVBoxLayout, QLineEdit, QPushButton, QLabel
from PySide6.QtCore import Signal, Slot

class RegistrationForm(QWidget):
    registration_successful = Signal()

    def __init__(self, register_user_func):
        super().__init__()
        self.register_user_func = register_user_func
        
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
        self.register_button.clicked.connect(self.register_user)
        layout.addWidget(self.register_button)
        
        self.message_label = QLabel()
        layout.addWidget(self.message_label)
        
        self.setLayout(layout)

    @Slot()
    def register_user(self):
        username = self.username_input.text()
        email = self.email_input.text()
        password = self.password_input.text()
        
        success = self.register_user_func(username, email, password)
        
        if success:
            self.message_label.setText("Registration successful!")
            self.registration_successful.emit()
        else:
            self.message_label.setText("Registration failed. Please try again.")