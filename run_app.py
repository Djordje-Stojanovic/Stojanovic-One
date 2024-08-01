# run_app.py

"""
This script serves as the entry point for the Stojanovic-One application.

It sets up the main window with options to access the login and registration forms,
initializes the database, and runs the application's event loop.
"""

import sys
from PySide6.QtWidgets import QApplication, QMainWindow, QVBoxLayout, QWidget, QPushButton
from stojanovic_one.ui.login_form import LoginForm
from stojanovic_one.ui.registration_form import RegistrationForm
from stojanovic_one.database.setup import initialize_database, create_user_table
from stojanovic_one.database.user_management import login_user, register_user

class MainWindow(QMainWindow):
    """
    The main window of the application.

    This window provides buttons to access the login and registration forms.
    It serves as the central hub of the application's user interface.

    Attributes:
        conn (sqlite3.Connection): The database connection used for user management operations.
    """

    def __init__(self, conn):
        """
        Initialize the main window.

        Args:
            conn (sqlite3.Connection): The database connection to be used for user management.
        """
        super().__init__()
        self.conn = conn
        self.setWindowTitle("Stojanovic-One")
        self.setGeometry(100, 100, 300, 200)

        self._setup_ui()

    def _setup_ui(self):
        """Set up the user interface components of the main window."""
        layout = QVBoxLayout()
        
        self.login_button = QPushButton("Login")
        self.login_button.clicked.connect(self.show_login_form)
        layout.addWidget(self.login_button)

        self.register_button = QPushButton("Register")
        self.register_button.clicked.connect(self.show_registration_form)
        layout.addWidget(self.register_button)

        container = QWidget()
        container.setLayout(layout)
        self.setCentralWidget(container)

    def show_login_form(self):
        """Create and display the login form."""
        self.login_form = LoginForm(login_user_func=lambda username, password: login_user(self.conn, username, password))
        self.login_form.show()

    def show_registration_form(self):
        """Create and display the registration form."""
        self.registration_form = RegistrationForm(register_user_func=lambda username, email, password: register_user(self.conn, username, email, password))
        self.registration_form.show()

def main():
    """
    The main function that runs the application.

    This function initializes the database, sets up the main window,
    and starts the application's event loop.
    """
    # Initialize the database
    conn = initialize_database('users.db')
    create_user_table(conn)

    # Create the application
    app = QApplication(sys.argv)

    # Create and show the main window
    main_window = MainWindow(conn)
    main_window.show()

    # Run the application
    sys.exit(app.exec())

if __name__ == "__main__":
    main()