# src/stojanovic_one/main.py

import sys
from PySide6.QtWidgets import QApplication, QMainWindow, QStackedWidget, QMessageBox
from stojanovic_one.ui.welcome_page import WelcomePage
from stojanovic_one.ui.login_form import LoginForm
from stojanovic_one.ui.registration_form import RegistrationForm
from stojanovic_one.ui.logout_form import LogoutForm
from stojanovic_one.database.setup import initialize_database, create_user_table
from stojanovic_one.database.user_management import login_user, register_user, logout_user

class MainWindow(QMainWindow):
    def __init__(self, conn, test_mode=False):
        super().__init__()
        self.conn = conn
        self.current_token = None
        self.test_mode = test_mode
        self.setWindowTitle("Stojanovic-One")
        self.setGeometry(100, 100, 800, 600)

        self.stacked_widget = QStackedWidget()
        self.setCentralWidget(self.stacked_widget)

        self.welcome_page = WelcomePage()
        self.login_form = LoginForm(login_user_func=self.login_user)
        self.registration_form = RegistrationForm(register_user_func=self.register_user)
        self.logout_form = LogoutForm(logout_user_func=self.logout_user)

        self.stacked_widget.addWidget(self.welcome_page)
        self.stacked_widget.addWidget(self.login_form)
        self.stacked_widget.addWidget(self.registration_form)
        self.stacked_widget.addWidget(self.logout_form)

        # Make sure these connections are correct
        self.welcome_page.login_clicked.connect(self.show_login_form)
        self.welcome_page.register_clicked.connect(self.show_registration_form)
        self.registration_form.registration_successful.connect(self.on_registration_successful)
        self.login_form.login_successful.connect(self.on_login_successful)

        self.stacked_widget.setCurrentWidget(self.welcome_page)

    def show_login_form(self):
        print("Showing login form")
        self.stacked_widget.setCurrentWidget(self.login_form)

    def show_registration_form(self):
        print("Showing registration form")
        self.stacked_widget.setCurrentWidget(self.registration_form)

    def on_registration_successful(self):
        print("Registration successful")
        self.stacked_widget.setCurrentWidget(self.welcome_page)

    def on_login_successful(self, username, password):
        print(f"Login successful for user: {username}")
        self.stacked_widget.setCurrentWidget(self.welcome_page)

    def show_logout_form(self):
        if self.current_token:
            self.logout_form.set_token(self.current_token)
            self.stacked_widget.setCurrentWidget(self.logout_form)
        else:
            QMessageBox.information(self, "Logout", "No user is currently logged in.")

    def login_user(self, username: str, password: str) -> bool:
        print(f"Attempting to log in user: {username}")
        token = login_user(self.conn, username, password)
        if token:
            self.current_token = token
            print(f"Login successful. Token: {token}")
            if not self.test_mode:
                QMessageBox.information(self, "Login Successful", f"Welcome, {username}!")
            return True
        else:
            print("Login failed")
            if not self.test_mode:
                QMessageBox.warning(self, "Login Failed", "Invalid username or password.")
            return False

    def register_user(self, username: str, email: str, password: str) -> bool:
        print(f"Attempting to register user: {username}")
        if register_user(self.conn, username, email, password):
            print("Registration successful")
            if not self.test_mode:
                QMessageBox.information(self, "Registration Successful", "You can now log in with your new account.")
            return True
        else:
            print("Registration failed")
            if not self.test_mode:
                QMessageBox.warning(self, "Registration Failed", "An error occurred during registration.")
            return False

    def logout_user(self, token: str) -> bool:
        print(f"Attempting to log out user with token: {token}")
        if logout_user(token):
            self.current_token = None
            print("Logout successful")
            QMessageBox.information(self, "Logout Successful", "You have been logged out.")
            self.stacked_widget.setCurrentWidget(self.welcome_page)
            return True
        else:
            print("Logout failed")
            QMessageBox.warning(self, "Logout Failed", "An error occurred during logout.")
            return False

def main(test_mode=False):
    app = QApplication.instance()
    if app is None:
        app = QApplication(sys.argv)

    conn = initialize_database('users.db')
    create_user_table(conn)

    main_window = MainWindow(conn, test_mode=test_mode)
    main_window.show()

    if test_mode:
        return main_window
    else:
        return app.exec()

if __name__ == "__main__":
    main()