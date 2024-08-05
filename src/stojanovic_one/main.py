# src/stojanovic_one/main.py

import sys
import traceback
import bcrypt
from PySide6.QtWidgets import QApplication, QMainWindow, QStackedWidget, QMessageBox
from PySide6.QtCore import QMetaObject, Qt, Q_ARG
from stojanovic_one.ui.welcome_page import WelcomePage
from stojanovic_one.ui.login_form import LoginForm
from stojanovic_one.ui.registration_form import RegistrationForm
from stojanovic_one.ui.logout_form import LogoutForm
from stojanovic_one.database.setup import initialize_database, create_user_table
from stojanovic_one.database.user_management import login_user, register_user, logout_user
from stojanovic_one.auth.middleware import protect_route, JWTMiddleware
from stojanovic_one.auth.rate_limiting import RateLimiter
from typing import Tuple, Optional
import logging


class MainWindow(QMainWindow):
    def __init__(self, conn, test_mode=False):
        super().__init__()
        logging.info("MainWindow __init__ started")
        self.conn = conn
        self.current_token = None
        self.test_mode = test_mode
        self.setWindowTitle("Stojanovic-One")
        self.setGeometry(100, 100, 800, 600)

        self.stacked_widget = QStackedWidget(self)
        self.setCentralWidget(self.stacked_widget)

        self.welcome_page = WelcomePage()
        self.login_form = LoginForm(login_user_func=self.login_user)        
        self.registration_form = RegistrationForm(register_user_func=self.register_user)
        logging.debug(f"RegistrationForm initialized: {self.registration_form}")
        self.logout_form = LogoutForm(logout_user_func=self.logout_user)

        self.stacked_widget.addWidget(self.welcome_page)
        self.stacked_widget.addWidget(self.login_form)
        self.stacked_widget.addWidget(self.registration_form)
        self.stacked_widget.addWidget(self.logout_form)
        logging.debug("All forms added to stacked widget")

        logging.debug("Connecting signals")
        self.welcome_page.login_clicked.connect(self.show_login_form)
        self.welcome_page.register_clicked.connect(self.show_registration_form)
        self.welcome_page.logout_clicked.connect(self.show_logout_form)
        logging.debug("Signals connected")
        self.registration_form.registration_successful.connect(self.on_registration_successful)
        self.login_form.login_successful.connect(self.on_login_successful)
        self.logout_form.logout_successful.connect(self.perform_logout)
        self.jwt_middleware = JWTMiddleware()
        self.jwt_middleware.authentication_failed.connect(self.handle_auth_failure)
        self.rate_limiter = RateLimiter()

        logging.info("MainWindow initialized")
        self.show_welcome_page()
        logging.info("MainWindow __init__ completed")

    def cleanup(self):
        # Disconnect all signals
        logging.info("MainWindow cleanup started")
        try:
            self.welcome_page.login_clicked.disconnect()
            self.welcome_page.register_clicked.disconnect()
            self.welcome_page.logout_clicked.disconnect()
            self.registration_form.registration_successful.disconnect()
            self.login_form.login_successful.disconnect()
            self.logout_form.logout_successful.disconnect()
            self.jwt_middleware.authentication_failed.disconnect()
        except:
            pass  # In case some signals were not connected
        logging.info("MainWindow cleanup completed")

    def closeEvent(self, event):
        logging.info("MainWindow closeEvent called")
        self.cleanup()
        super().closeEvent(event)
        logging.info("MainWindow closeEvent completed")

    def __del__(self):
        self.cleanup()

    def show_login_form(self):
        logging.debug("show_login_form called")
        self.stacked_widget.setCurrentWidget(self.login_form)
        logging.debug(f"Current widget after setCurrentWidget: {self.stacked_widget.currentWidget()}")
        QApplication.processEvents()

    def show_registration_form(self):
        logging.debug("show_registration_form called")
        current_widget = self.stacked_widget.currentWidget()
        logging.debug(f"Current widget before change: {current_widget}")
        self.stacked_widget.setCurrentWidget(self.registration_form)
        current_widget = self.stacked_widget.currentWidget()
        logging.debug(f"Current widget after change: {current_widget}")
        QApplication.processEvents()
        
        # Add this line to ensure the registration form is visible
        self.registration_form.show()

    def show_welcome_page(self):
        logging.debug("show_welcome_page called")
        self.stacked_widget.setCurrentWidget(self.welcome_page)
        logging.debug(f"Current widget after setCurrentWidget: {self.stacked_widget.currentWidget()}")
        QApplication.processEvents()

    @protect_route
    def show_logout_form(self):
        print("show_logout_form called")
        if self.current_token:
            self.logout_form.set_token(self.current_token)
            self.stacked_widget.setCurrentWidget(self.logout_form)
        else:
            print("No valid token, redirecting to welcome page")
            self.handle_auth_failure()

    def on_registration_successful(self):
        print("Registration successful")
        self.stacked_widget.setCurrentWidget(self.welcome_page)

    def on_login_successful(self, username, password):
        print(f"Login successful for user: {username}")
        self.welcome_page.update_ui_after_login(True)
        self.stacked_widget.setCurrentWidget(self.welcome_page)

    def is_authenticated(self):
        return self.current_token is not None

    def update_auth_state(self, is_authenticated):
        QMetaObject.invokeMethod(self.welcome_page, "update_ui_after_login",
                                Qt.QueuedConnection,
                                Q_ARG(bool, is_authenticated))

    def login_user(self, username: str, password: str) -> Tuple[bool, Optional[str]]:
        if self.rate_limiter.is_rate_limited(username):
            error_message = "Too many login attempts. Please try again later."
            if not self.test_mode:
                QMessageBox.warning(self, "Login Failed", error_message)
            return False, error_message

        token = login_user(self.conn, username, password)
        if token:
            self.current_token = token
            self.update_auth_state(True)
            if not self.test_mode:
                QMessageBox.information(self, "Login Successful", f"Welcome, {username}!")
            return True, None
        else:
            error_message = "Invalid username or password. Please try again."
            if not self.test_mode:
                QMessageBox.warning(self, "Login Failed", error_message)
            self.update_auth_state(False)
            return False, error_message

    def register_user(self, username: str, email: str, password: str) -> Tuple[bool, Optional[str]]:
        success = register_user(self.conn, username, email, password)
        if success:
            if not self.test_mode:
                QMessageBox.information(self, "Registration Successful", "You can now log in with your new account.")
            return True, None
        else:
            error_message = "Registration failed. Username or email may already be in use."
            if not self.test_mode:
                QMessageBox.warning(self, "Registration Failed", error_message)
            return False, error_message

    def logout_user(self, token: str) -> Tuple[bool, Optional[str]]:
        if logout_user(token):
            if not self.test_mode:
                QMessageBox.information(self, "Logout Successful", "You have been logged out.")
            return True, None
        else:
            error_message = "An error occurred during logout. Please try again."
            if not self.test_mode:
                QMessageBox.warning(self, "Logout Failed", error_message)
            return False, error_message
    
    @protect_route
    def perform_logout(self) -> Tuple[bool, Optional[str]]:
        if self.current_token:
            success, message = self.logout_user(self.current_token)
            if success:
                self.current_token = None
                self.update_auth_state(False)
                self.stacked_widget.setCurrentWidget(self.welcome_page)
            return success, message
        return False, "No active session to logout"

    def handle_auth_failure(self):
        print("Authentication failed")
        self.current_token = None
        self.update_auth_state(False)
        self.stacked_widget.setCurrentWidget(self.welcome_page)
        if not self.test_mode:
            QMessageBox.warning(self, "Authentication Failed", "Your session has expired. Please log in again.")


def main(test_mode=False):
    try:
        if test_mode:
            conn = None  # Use a mock connection for testing
        else:
            conn = initialize_database('users.db')
            create_user_table(conn)

        main_window = MainWindow(conn, test_mode=test_mode)
        main_window.show()

        return main_window
    except Exception as e:
        print(f"An error occurred in main: {str(e)}")
        traceback.print_exc()
        return None

if __name__ == "__main__":
    print("Starting application")
    app = QApplication(sys.argv)
    window = main()
    if window:
        sys.exit(app.exec())