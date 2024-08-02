# src/stojanovic_one/ui/welcome_page.py

from PySide6.QtWidgets import QWidget, QVBoxLayout, QLabel, QPushButton, QApplication
from PySide6.QtCore import Qt, Signal
from PySide6.QtGui import QFont

class WelcomePage(QWidget):
    login_clicked = Signal()
    register_clicked = Signal()

    def __init__(self):
        super().__init__()

        self.setWindowTitle("Welcome to Stojanovic-One")

        layout = QVBoxLayout()

        self.welcome_label = QLabel("Welcome to Stojanovic-One")
        self.welcome_label.setAlignment(Qt.AlignCenter)
        self.welcome_label.setFont(QFont("Arial", 24, QFont.Bold))
        layout.addWidget(self.welcome_label)

        self.description_label = QLabel("A powerful Python application for managing your tasks and projects.")
        self.description_label.setAlignment(Qt.AlignCenter)
        self.description_label.setWordWrap(True)
        layout.addWidget(self.description_label)

        self.login_button = QPushButton("Login")
        self.login_button.setFixedSize(200, 50)
        self.login_button.clicked.connect(self.login_clicked.emit)
        layout.addWidget(self.login_button, alignment=Qt.AlignCenter)

        self.register_button = QPushButton("Register")
        self.register_button.setFixedSize(200, 50)
        self.register_button.clicked.connect(self.register_clicked.emit)
        layout.addWidget(self.register_button, alignment=Qt.AlignCenter)

        self.setLayout(layout)

    def resizeEvent(self, event):
        super().resizeEvent(event)
        
        window_width = self.width()
        if window_width < 600:
            new_font = QFont("Arial", 20, QFont.Bold)
        else:
            new_font = QFont("Arial", 24, QFont.Bold)
        
        self.welcome_label.setFont(new_font)
        self.description_label.setFont(QFont("Arial", 12 if window_width < 600 else 14))
        
        button_width = min(200, int(window_width * 0.8))
        self.login_button.setFixedSize(button_width, 50)
        self.register_button.setFixedSize(button_width, 50)

        self.update()
        QApplication.processEvents()