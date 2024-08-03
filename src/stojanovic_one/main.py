# src/stojanovic_one/main.py

import sys
from PySide6.QtWidgets import QApplication, QMainWindow, QStackedWidget, QMessageBox
from stojanovic_one.ui.welcome_page import WelcomePage
from stojanovic_one.ui.login_form import LoginForm
from stojanovic_one.ui.registration_form import RegistrationForm
from stojanovic_one.ui.logout_form import LogoutForm
from stojanovic_one.database.setup import initialize_database, create_user_table
from stojanovic_one.database.user_management import login_user, register_user, logout_user
from stojanovic_one.auth.middleware import protect_route, JWTMiddleware

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

        self.welcome_page.login_clicked.connect(self.show_login_form)
        self.welcome_page.register_clicked.connect(self.show_registration_form)
        self.welcome_page.logout_clicked.connect(self.show_logout_form)
        self.registration_form.registration_successful.connect(self.on_registration_successful)
        self.login_form.login_successful.connect(self.on_login_successful)
        self.logout_form.logout_successful.connect(self.perform_logout)
        self.welcome_page.logout_clicked.connect(self.perform_logout)
        self.jwt_middleware = JWTMiddleware()
        self.jwt_middleware.authentication_failed.connect(self.handle_auth_failure)

        print("MainWindow initialized")
        self.stacked_widget.setCurrentWidget(self.welcome_page)

    def show_login_form(self):
        print("show_login_form called")
        self.stacked_widget.setCurrentWidget(self.login_form)

    def show_registration_form(self):
        print("show_registration_form called")
        self.stacked_widget.setCurrentWidget(self.registration_form)

    def show_logout_form(self):
        print("show_logout_form called")
        if self.current_token:
            self.logout_form.set_token(self.current_token)
            self.stacked_widget.setCurrentWidget(self.logout_form)
        else:
            QMessageBox.information(self, "Logout", "No user is currently logged in.")

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
        self.welcome_page.update_ui_after_login(is_authenticated)

    def login_user(self, username: str, password: str) -> bool:
        token = login_user(self.conn, username, password)
        if token:
            self.current_token = token
            self.update_auth_state(True)
            if not self.test_mode:
                QMessageBox.information(self, "Login Successful", f"Welcome, {username}!")
            return True
        else:
            if not self.test_mode:
                QMessageBox.warning(self, "Login Failed", "Invalid username or password. Please try again.")
            return False

    def register_user(self, username: str, email: str, password: str) -> bool:
        if register_user(self.conn, username, email, password):
            if not self.test_mode:
                QMessageBox.information(self, "Registration Successful", "You can now log in with your new account.")
            return True
        else:
            if not self.test_mode:
                QMessageBox.warning(self, "Registration Failed", "Registration failed. Username or email may already be in use.")
            return False
    
    def perform_logout(self):
        if self.current_token:
            self.logout_user(self.current_token)
            
    def logout_user(self, token: str) -> bool:
        if logout_user(token):
            self.current_token = None
            self.update_auth_state(False)
            if not self.test_mode:
                QMessageBox.information(self, "Logout Successful", "You have been logged out.")
            self.stacked_widget.setCurrentWidget(self.welcome_page)
            return True
        else:
            if not self.test_mode:
                QMessageBox.warning(self, "Logout Failed", "An error occurred during logout. Please try again.")
            return False
    
    @protect_route
    def some_protected_method(self):
        # This method can only be called by authenticated users
        print("This is a protected method")

    @protect_route
    def show_logout_form(self):
        print("show_logout_form called")
        if self.current_token:
            self.logout_form.set_token(self.current_token)
            self.stacked_widget.setCurrentWidget(self.logout_form)
        else:
            print("No valid token, redirecting to welcome page")
            self.stacked_widget.setCurrentWidget(self.welcome_page)

    def perform_logout(self):
        if self.current_token:
            self.logout_user(self.current_token)
    
    def handle_auth_failure(self):
        print("Authentication failed")
        self.current_token = None
        self.welcome_page.update_ui_after_login(False)
        self.stacked_widget.setCurrentWidget(self.welcome_page)
        if not self.test_mode:
            QMessageBox.warning(self, "Authentication Failed", "Your session has expired. Please log in again.")


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
    print("Starting application")
    main()