# src/stojanovic_one/ui/welcome_page.py

from PySide6.QtWidgets import QWidget, QVBoxLayout, QLabel, QPushButton, QApplication
from PySide6.QtCore import Qt, Signal, QTimer
from PySide6.QtGui import QFont, QColor, QPalette

class WelcomePage(QWidget):
    login_clicked = Signal()
    register_clicked = Signal()
    logout_clicked = Signal()

    def __init__(self):
        super().__init__()
        self.setup_ui()

        self.setWindowTitle("Welcome to Stojanovic-One")
        self.setStyleSheet("background-color: #f0f0f0;")

        layout = QVBoxLayout()
        layout.setSpacing(20)
        layout.setContentsMargins(40, 40, 40, 40)

        self.welcome_label = QLabel("Welcome to Stojanovic-One")
        self.welcome_label.setAlignment(Qt.AlignCenter)
        self.welcome_label.setFont(QFont("Arial", 24, QFont.Bold))
        self.welcome_label.setStyleSheet("color: #2c3e50;")
        layout.addWidget(self.welcome_label)

        self.description_label = QLabel("A powerful Python application for managing your tasks and projects.")
        self.description_label.setAlignment(Qt.AlignCenter)
        self.description_label.setWordWrap(True)
        self.description_label.setStyleSheet("color: #34495e; font-size: 16px;")
        layout.addWidget(self.description_label)

        self.login_button = QPushButton("Login")
        self.login_button.clicked.connect(self._on_login_clicked)
        self.login_button.setStyleSheet("""
            QPushButton {
                background-color: #3498db;
                color: white;
                border-radius: 5px;
                font-size: 16px;
            }
            QPushButton:hover {
                background-color: #2980b9;
            }
        """)
        layout.addWidget(self.login_button, alignment=Qt.AlignCenter)

        self.register_button = QPushButton("Register")
        self.register_button.clicked.connect(self._on_register_clicked)
        self.register_button.setStyleSheet("""
            QPushButton {
                background-color: #2ecc71;
                color: white;
                border-radius: 5px;
                font-size: 16px;
            }
            QPushButton:hover {
                background-color: #27ae60;
            }
        """)
        layout.addWidget(self.register_button, alignment=Qt.AlignCenter)

        self.logout_button = QPushButton("Logout")
        self.logout_button.clicked.connect(self._on_logout_clicked)
        self.logout_button.setStyleSheet("""
            QPushButton {
                background-color: #e74c3c;
                color: white;
                border-radius: 5px;
                font-size: 16px;
            }
            QPushButton:hover {
                background-color: #c0392b;
            }
        """)
        self.logout_button.hide()  # Hide the logout button initially
        layout.addWidget(self.logout_button, alignment=Qt.AlignCenter)

        self.setLayout(layout)

        # Timer for delayed resize event
        self.resize_timer = QTimer(self)
        self.resize_timer.setSingleShot(True)
        self.resize_timer.timeout.connect(self.delayed_resize)

    def setup_ui(self):
        layout = QVBoxLayout()
        self.login_button = QPushButton("Login")
        self.register_button = QPushButton("Register")
        self.logout_button = QPushButton("Logout")
        self.logout_button.hide()  # Initially hidden

        layout.addWidget(self.login_button)
        layout.addWidget(self.register_button)
        layout.addWidget(self.logout_button)

        self.setLayout(layout)

        self.login_button.clicked.connect(self.login_clicked.emit)
        self.register_button.clicked.connect(self.register_clicked.emit)
        self.logout_button.clicked.connect(self.logout_clicked.emit)

    def _on_login_clicked(self):
        print("Login button clicked")
        self.login_clicked.emit()

    def _on_register_clicked(self):
        print("Register button clicked")
        self.register_clicked.emit()

    def _on_logout_clicked(self):
        print("Logout button clicked")
        self.logout_clicked.emit()

    def update_ui_after_login(self, is_logged_in: bool):
        if is_logged_in:
            self.login_button.hide()
            self.register_button.hide()
            self.logout_button.show()
        else:
            self.login_button.show()
            self.register_button.show()
            self.logout_button.hide()

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