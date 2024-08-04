# src/stojanovic_one/ui/welcome_page.py

from PySide6.QtWidgets import QWidget, QVBoxLayout, QLabel, QPushButton, QApplication
from PySide6.QtCore import Qt, Signal, QTimer, QMetaObject, Q_ARG
from PySide6.QtGui import QFont, QColor, QPalette
import logging

class WelcomePage(QWidget):
    login_clicked = Signal()
    register_clicked = Signal()
    logout_clicked = Signal()

    def __init__(self):
        super().__init__()
        self.setup_ui()

        self.setWindowTitle("Welcome to Stojanovic-One")
        self.setStyleSheet("background-color: #f0f0f0;")

        # Add the welcome and description labels
        self.welcome_label = QLabel("Welcome to Stojanovic-One")
        self.welcome_label.setAlignment(Qt.AlignCenter)
        self.welcome_label.setFont(QFont("Arial", 24, QFont.Bold))
        self.welcome_label.setStyleSheet("color: #2c3e50;")
        self.layout().insertWidget(0, self.welcome_label)

        self.description_label = QLabel("A powerful Python application for managing your tasks and projects.")
        self.description_label.setAlignment(Qt.AlignCenter)
        self.description_label.setWordWrap(True)
        self.description_label.setStyleSheet("color: #34495e; font-size: 16px;")
        self.layout().insertWidget(1, self.description_label)

        # Style the buttons
        for button in [self.login_button, self.register_button, self.logout_button]:
            button.setStyleSheet("""
                QPushButton {
                    color: white;
                    border-radius: 5px;
                    font-size: 16px;
                }
                QPushButton:hover {
                    background-color: darker;
                }
            """)
        
        self.login_button.setStyleSheet(self.login_button.styleSheet() + "background-color: #3498db;")
        self.register_button.setStyleSheet(self.register_button.styleSheet() + "background-color: #2ecc71;")
        self.logout_button.setStyleSheet(self.logout_button.styleSheet() + "background-color: #e74c3c;")

        # Timer for delayed resize event
        self.resize_timer = QTimer(self)
        self.resize_timer.setSingleShot(True)
        self.resize_timer.timeout.connect(self.delayed_resize)

    def setup_ui(self):
        layout = QVBoxLayout()
        layout.setSpacing(20)
        layout.setContentsMargins(40, 40, 40, 40)

        self.login_button = QPushButton("Login")
        self.register_button = QPushButton("Register")
        self.logout_button = QPushButton("Logout")
        self.logout_button.hide()  # Initially hidden

        layout.addWidget(self.login_button, alignment=Qt.AlignCenter)
        layout.addWidget(self.register_button, alignment=Qt.AlignCenter)
        layout.addWidget(self.logout_button, alignment=Qt.AlignCenter)

        self.setLayout(layout)

        self.login_button.clicked.connect(self._on_login_clicked)
        self.register_button.clicked.connect(self._on_register_clicked)
        self.logout_button.clicked.connect(self._on_logout_clicked)

    def _on_login_clicked(self):
        logging.debug("Login button clicked")
        self.login_clicked.emit()

    def _on_register_clicked(self):
        logging.debug("Register button clicked")
        self.register_clicked.emit()

    def _on_logout_clicked(self):
        logging.debug("Logout button clicked")
        self.logout_clicked.emit()

    def update_ui_after_login(self, is_logged_in: bool):
        self._update_ui_after_login(is_logged_in)

    def _update_ui_after_login(self, is_logged_in: bool):
        self.logout_button.setVisible(is_logged_in)
        self.login_button.setVisible(not is_logged_in)
        self.register_button.setVisible(not is_logged_in)
        QApplication.processEvents()  # Force processing of events

    def resizeEvent(self, event):
        super().resizeEvent(event)
        self.resize_timer.start(100)  # Delay the resize event by 100ms

    def delayed_resize(self):
        window_width = self.width()
        if window_width < 600:
            new_font = QFont("Arial", 20, QFont.Bold)
            button_width = 320  # Set to exactly 320 for small screens
        else:
            new_font = QFont("Arial", 24, QFont.Bold)
            button_width = 200
        
        self.welcome_label.setFont(new_font)
        self.description_label.setFont(QFont("Arial", 12 if window_width < 600 else 16))
        
        self.login_button.setFixedSize(button_width, 50)
        self.register_button.setFixedSize(button_width, 50)
        self.logout_button.setFixedSize(button_width, 50)

        self.update()
        QApplication.processEvents()

    def showEvent(self, event):
        super().showEvent(event)
        self.delayed_resize()  # Force a resize event to update the UI