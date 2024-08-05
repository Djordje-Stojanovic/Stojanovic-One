# tests/test_main.py

import pytest
from PySide6.QtWidgets import QApplication
from PySide6.QtCore import Qt, QTimer
from PySide6.QtTest import QTest
from stojanovic_one.main import main, MainWindow
from stojanovic_one.ui.welcome_page import WelcomePage
from stojanovic_one.ui.login_form import LoginForm
from stojanovic_one.ui.registration_form import RegistrationForm
import traceback
from stojanovic_one.auth.jwt_utils import generate_token
import logging
import bcrypt

logging.basicConfig(level=logging.DEBUG)

@pytest.fixture(scope="session")
def qapp():
    app = QApplication.instance()
    if app is None:
        app = QApplication([])
    yield app
    app.quit()

@pytest.fixture(scope="function")
def main_window(qapp, qtbot, mocker):
    window = None
    try:
        logging.info("main_window fixture: setup started")
        mock_conn = mocker.Mock()
        mocker.patch('stojanovic_one.main.initialize_database', return_value=mock_conn)
        mocker.patch('stojanovic_one.main.create_user_table')

        window = MainWindow(mock_conn, test_mode=True)
        window.show()
        qtbot.addWidget(window)
        qtbot.waitForWindowShown(window)
        
        logging.info("main_window fixture: setup completed")
        yield window
    except Exception as e:
        logging.error(f"Error in main_window fixture: {str(e)}")
        logging.error(traceback.format_exc())
        pytest.fail(f"main_window fixture failed: {str(e)}")
    finally:
        if window:
            try:
                logging.info("main_window fixture: teardown started")
                QApplication.processEvents()
                window.hide()
                window.deleteLater()
                QApplication.processEvents()
                logging.info("main_window fixture: teardown completed")
            except Exception as e:
                logging.error(f"Error in main_window fixture teardown: {str(e)}")
                logging.error(traceback.format_exc())

@pytest.fixture
def setup_and_teardown(qtbot):
    yield
    QTest.qWait(100)  # Wait for any pending events to process

@pytest.mark.gui
def test_main(main_window, qtbot):
    assert isinstance(main_window, MainWindow)
    assert main_window.isVisible()

    def check_welcome_page():
        assert main_window.stacked_widget.currentWidget() == main_window.welcome_page

    QTimer.singleShot(500, check_welcome_page)
    qtbot.wait(1000)

@pytest.mark.gui
def test_main_window_navigation(main_window, qtbot):
    try:
        def log_current_widget():
            current = main_window.stacked_widget.currentWidget()
            logging.debug(f"Current widget: {current}")

        logging.debug("Starting test_main_window_navigation")
        log_current_widget()

        # Test navigation to login form
        logging.debug("Clicking login button")
        qtbot.mouseClick(main_window.welcome_page.login_button, Qt.LeftButton)
        qtbot.waitUntil(lambda: isinstance(main_window.stacked_widget.currentWidget(), LoginForm), timeout=5000)
        assert isinstance(main_window.stacked_widget.currentWidget(), LoginForm), "Failed to navigate to login form"
        logging.debug("Navigated to login form")

        # Test navigation back to welcome page
        logging.debug("Navigating back to welcome page")
        main_window.show_welcome_page()
        qtbot.waitUntil(lambda: isinstance(main_window.stacked_widget.currentWidget(), WelcomePage), timeout=5000)
        assert isinstance(main_window.stacked_widget.currentWidget(), WelcomePage), "Failed to return to welcome page"
        logging.debug("Returned to welcome page")

        # Test navigation to registration form
        logging.debug("Clicking register button")
        qtbot.mouseClick(main_window.welcome_page.register_button, Qt.LeftButton)
        logging.debug("Register button clicked")

        def check_registration_form():
            current_widget = main_window.stacked_widget.currentWidget()
            logging.debug(f"Current widget in check: {current_widget}")
            is_registration_form = isinstance(current_widget, RegistrationForm)
            logging.debug(f"Is RegistrationForm: {is_registration_form}")
            return is_registration_form

        logging.debug("Waiting for RegistrationForm")
        qtbot.waitUntil(check_registration_form, timeout=5000)
        logging.debug("Wait completed")

        current_widget = main_window.stacked_widget.currentWidget()
        logging.debug(f"Final current widget: {current_widget}")
        assert isinstance(current_widget, RegistrationForm), "Failed to navigate to registration form"
        logging.debug("Test completed successfully")
    except Exception as e:
        logging.error(f"Error in test_main_window_navigation: {str(e)}")
        logging.error(traceback.format_exc())
        pytest.fail(f"test_main_window_navigation failed: {str(e)}")

@pytest.mark.gui
def test_login_logout_flow(main_window, qtbot, mocker):
    try:
        logging.debug("Starting test_login_logout_flow")

        # Mock bcrypt.checkpw to always return True
        mocker.patch('bcrypt.checkpw', return_value=True)

        # Mock the login_user function to return a token directly
        mock_login = mocker.patch('stojanovic_one.database.user_management.login_user', return_value=generate_token("testuser"))

        logging.debug("Attempting login")
        with qtbot.waitSignal(main_window.login_form.login_successful, timeout=5000):
            result, error_message = main_window.login_user("testuser", "password123")
        
        logging.debug(f"Login result: {result}, error_message: {error_message}")
        
        assert result == True, f"Login failed, result: {result}, error: {error_message}"
        assert main_window.current_token is not None, f"Token is None: {main_window.current_token}"
        logging.debug("Login assertions passed")

        # Mock the logout_user function
        mock_logout = mocker.patch('stojanovic_one.database.user_management.logout_user', return_value=True)
        
        logging.debug("Attempting logout")
        with qtbot.waitSignal(main_window.logout_form.logout_successful, timeout=5000):
            success, _ = main_window.perform_logout()
        
        logging.debug(f"Logout success: {success}")
        
        assert success == True, f"Logout failed, success: {success}"
        assert mock_logout.called, "Logout function was not called"
        assert main_window.current_token is None, f"Token not cleared: {main_window.current_token}"
        logging.debug("Logout assertions passed")

    except Exception as e:
        logging.error(f"Test failed: {str(e)}")
        logging.error(traceback.format_exc())
        pytest.fail(f"Test failed due to exception: {str(e)}")

@pytest.mark.gui
def test_registration_flow(main_window, qtbot, mocker):
    try:
        logging.debug("Starting test_registration_flow")

        mock_register = mocker.patch('stojanovic_one.database.user_management.register_user', return_value=(True, None))
        logging.debug("Mock register created")

        def trigger_registration():
            main_window.register_user("newuser", "newuser@example.com", "password123")

        QTimer.singleShot(100, trigger_registration)
        
        with qtbot.waitSignal(main_window.registration_form.registration_successful, timeout=5000):
            main_window.show_registration_form()

        result, error_message = mock_register.return_value
        logging.debug(f"Registration result: {result}, Error message: {error_message}")

        assert result == True, f"Registration failed, result: {result}, error: {error_message}"
        assert error_message is None, f"Unexpected error message: {error_message}"
        mock_register.assert_called_once_with(main_window.conn, "newuser", "newuser@example.com", "password123")
        
        logging.debug("Registration assertions passed")

    except Exception as e:
        logging.error(f"Test failed: {str(e)}")
        logging.error(traceback.format_exc())
        pytest.fail(f"Test failed due to exception: {str(e)}")

@pytest.mark.gui
def test_protected_routes(main_window, qtbot, mocker):
    try:
        main_window.show_logout_form()
        qtbot.waitUntil(lambda: main_window.stacked_widget.currentWidget() == main_window.welcome_page, timeout=5000)

        main_window.current_token = generate_token("testuser")

        main_window.show_logout_form()
        qtbot.waitUntil(lambda: main_window.stacked_widget.currentWidget() == main_window.logout_form, timeout=5000)

        mock_validate = mocker.patch('stojanovic_one.auth.jwt_utils.validate_token', return_value=None)
        
        main_window.handle_auth_failure()

        qtbot.waitUntil(lambda: main_window.stacked_widget.currentWidget() == main_window.welcome_page, timeout=5000)
        assert main_window.current_token is None

    except Exception as e:
        logging.error(f"Test failed: {str(e)}")
        logging.error(traceback.format_exc())
        pytest.fail(f"Test failed due to exception: {str(e)}")

@pytest.mark.gui
def test_auth_state_management(main_window, qtbot):
    try:
        logging.debug("Starting test_auth_state_management")

        assert not main_window.is_authenticated()
        logging.debug("Initial authentication state checked")

        main_window.current_token = "fake_token"
        qtbot.wait(500)  # Increased delay
        assert main_window.is_authenticated()
        logging.debug("Authentication state after setting token checked")

        main_window.current_token = None
        qtbot.wait(500)  # Increased delay
        assert not main_window.is_authenticated()
        logging.debug("Authentication state after removing token checked")

        def check_logged_in_state():
            return (main_window.welcome_page.logout_button.isVisible() and
                    not main_window.welcome_page.login_button.isVisible() and
                    not main_window.welcome_page.register_button.isVisible())

        def check_logged_out_state():
            return (not main_window.welcome_page.logout_button.isVisible() and
                    main_window.welcome_page.login_button.isVisible() and
                    main_window.welcome_page.register_button.isVisible())

        main_window.update_auth_state(True)
        qtbot.waitUntil(check_logged_in_state, timeout=5000)
        logging.debug(f"Logged in state: {check_logged_in_state()}")

        main_window.update_auth_state(False)
        qtbot.waitUntil(check_logged_out_state, timeout=5000)
        logging.debug(f"Logged out state: {check_logged_out_state()}")

        logging.debug("test_auth_state_management completed successfully")
    except Exception as e:
        logging.error(f"Test failed: {str(e)}")
        logging.error(traceback.format_exc())
        pytest.fail(f"Test failed due to exception: {str(e)}")

@pytest.mark.gui
def test_error_messages(main_window, qtbot, mocker):
    try:
        logging.debug("Starting test_error_messages")

        # Test login error
        mocker.patch('stojanovic_one.database.user_management.login_user', return_value=None)
        mocker.patch('bcrypt.checkpw', return_value=False)  # Add this line
        result, error_message = main_window.login_user("nonexistent", "wrongpassword")
        logging.debug(f"Login result: {result}, error_message: {error_message}")
        assert result == False, f"Expected login to fail, but got result: {result}"
        assert error_message == "Invalid username or password. Please try again.", f"Unexpected error message: {error_message}"

        # Test registration error
        mocker.patch('stojanovic_one.database.user_management.register_user', return_value=False)
        result, error_message = main_window.register_user("existinguser", "test@example.com", "password123")
        logging.debug(f"Registration result: {result}, error_message: {error_message}")
        assert result == False, f"Expected registration to fail, but got result: {result}"
        assert error_message == "Registration failed. Username or email may already be in use.", f"Unexpected error message: {error_message}"

        # Test logout error
        main_window.current_token = "fake_token"
        mocker.patch('stojanovic_one.database.user_management.logout_user', return_value=False)
        result, error_message = main_window.logout_user("fake_token")
        logging.debug(f"Logout result: {result}, error_message: {error_message}")
        assert result == False, f"Expected logout to fail, but got result: {result}"
        assert error_message == "An error occurred during logout. Please try again.", f"Unexpected error message: {error_message}"

        logging.debug("Error messages test completed successfully")
    except Exception as e:
        logging.error(f"Test failed: {str(e)}")
        logging.error(traceback.format_exc())
        pytest.fail(f"Test failed due to exception: {str(e)}")