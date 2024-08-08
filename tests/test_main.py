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

logging.basicConfig(level=logging.DEBUG)

@pytest.fixture(scope="function")
def main_window(qapp, qtbot, mocker):
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
    
    logging.info("main_window fixture: teardown started")
    window.cleanup()
    window.close()
    window.deleteLater()
    qapp.processEvents()
    QTest.qWait(1000)  # Increased wait time for deletion to complete
    logging.info("main_window fixture: teardown completed")

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
        logging.debug("Starting test_main_window_navigation")

        # Test navigation to login form
        logging.debug("Clicking login button")
        qtbot.mouseClick(main_window.welcome_page.login_button, Qt.LeftButton)
        qtbot.waitUntil(lambda: isinstance(main_window.stacked_widget.currentWidget(), LoginForm), timeout=5000)
        assert isinstance(main_window.stacked_widget.currentWidget(), LoginForm), "Failed to navigate to login form"
        logging.debug("Navigated to login form")

        QTest.qWait(100)  # Wait for UI to update

        # Test navigation back to welcome page
        logging.debug("Navigating back to welcome page")
        main_window.show_welcome_page()
        qtbot.waitUntil(lambda: isinstance(main_window.stacked_widget.currentWidget(), WelcomePage), timeout=5000)
        assert isinstance(main_window.stacked_widget.currentWidget(), WelcomePage), "Failed to return to welcome page"
        logging.debug("Returned to welcome page")

        QTest.qWait(100)  # Wait for UI to update

        # Test navigation to registration form
        logging.debug("Clicking register button")
        qtbot.mouseClick(main_window.welcome_page.register_button, Qt.LeftButton)
        qtbot.waitUntil(lambda: isinstance(main_window.stacked_widget.currentWidget(), RegistrationForm), timeout=5000)
        assert isinstance(main_window.stacked_widget.currentWidget(), RegistrationForm), "Failed to navigate to registration form"
        logging.debug("Navigated to registration form")

    except Exception as e:
        logging.error(f"Error in test_main_window_navigation: {str(e)}")
        logging.error(traceback.format_exc())
        pytest.fail(f"test_main_window_navigation failed: {str(e)}")

@pytest.mark.gui
def test_login_logout_flow(main_window, qtbot, mocker):
    # Add documentation for the test
    """
    This test checks the login and logout flow.
    """
    
    try:
        logging.debug("Starting test_login_logout_flow")

        mocker.patch('bcrypt.checkpw', return_value=True)
        mock_login = mocker.patch('stojanovic_one.database.user_management.login_user', return_value=generate_token("testuser"))
        mock_logout = mocker.patch('stojanovic_one.database.user_management.logout_user', return_value=True)

        # Perform login
        result, error_message = main_window.login_user("testuser", "password123")
        logging.debug(f"Login result: {result}, error_message: {error_message}")
        assert result == True, f"Expected login to succeed, but got result: {result}"
        assert error_message is None, f"Unexpected error message: {error_message}"

        QTest.qWait(500)  # Wait for UI to update

        # Perform logout
        result, error_message = main_window.logout_user("fake_token")
        logging.debug(f"Logout result: {result}, error_message: {error_message}")
        assert result == True, f"Expected logout to succeed, but got result: {result}"
        assert error_message is None, f"Unexpected error message: {error_message}"
        assert mock_logout.called, "Logout function was not called"

        logging.debug("Login and logout flow test completed successfully")
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

        main_window.current_token = "fake_token"
        qtbot.wait(500)
        assert main_window.is_authenticated()

        main_window.current_token = None
        qtbot.wait(500)
        assert not main_window.is_authenticated()

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

        main_window.update_auth_state(False)
        qtbot.waitUntil(check_logged_out_state, timeout=5000)

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
        mocker.patch('bcrypt.checkpw', return_value=False)
        result, error_message = main_window.login_user("nonexistent", "wrongpassword")
        logging.debug(f"Login result: {result}, error_message: {error_message}")
        assert result == False, f"Expected login to fail, but got result: {result}"
        assert error_message == "Invalid username or password. Please try again.", f"Unexpected error message: {error_message}"

        QTest.qWait(500)  # Wait for UI to update

        # Test registration error
        mocker.patch('stojanovic_one.database.user_management.register_user', return_value=False)
        result, error_message = main_window.register_user("existinguser", "test@example.com", "password123")
        logging.debug(f"Registration result: {result}, error_message: {error_message}")
        assert result == False, f"Expected registration to fail, but got result: {result}"
        assert error_message == "Registration failed. Username or email may already be in use.", f"Unexpected error message: {error_message}"

        QTest.qWait(500)  # Wait for UI to update

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