# tests/test_main_security.py

import pytest
from PySide6.QtWidgets import QApplication
from PySide6.QtTest import QTest
from PySide6.QtCore import QTimer
from stojanovic_one.main import MainWindow
from stojanovic_one.auth.jwt_utils import generate_token, validate_token
from stojanovic_one.database.user_management import register_user
import bcrypt
import logging
import traceback  # Add this import at the top of the file

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
def test_rate_limiting(main_window, qtbot, mocker):
    try:
        mocker.patch('bcrypt.checkpw', return_value=False)
        mock_login = mocker.patch('stojanovic_one.database.user_management.login_user', return_value=None)

        for i in range(6):
            result, message = main_window.login_user("testuser", "wrongpassword")
            if i < 5:
                assert result == False
                assert message == "Invalid username or password. Please try again."
            else:
                assert result == False
                assert message == "Too many login attempts. Please try again later."
            QTest.qWait(100)  # Add a small delay between attempts

    except Exception as e:
        logging.error(f"Error in test_rate_limiting: {str(e)}")
        pytest.fail(f"Test failed: {str(e)}")

@pytest.mark.gui
def test_token_expiration(main_window, qtbot, mocker):
    try:
        expired_token = generate_token("testuser", expiration=1)
        main_window.current_token = expired_token

        # Mock the validate_token function to simulate an expired token
        mocker.patch('stojanovic_one.auth.jwt_utils.validate_token', return_value=None)

        # Mock the handle_auth_failure method
        mock_handle_auth_failure = mocker.patch.object(main_window, 'handle_auth_failure')

        def check_condition():
            main_window.show_logout_form()
            return mock_handle_auth_failure.called

        # Wait for the token to expire
        qtbot.wait(2000)

        # Try to access a protected route
        assert check_condition()

        # Verify that the current_token is None after expiration
        assert main_window.current_token is None

    except Exception as e:
        logging.error(f"Error in test_token_expiration: {str(e)}")
        logging.error(traceback.format_exc())
        pytest.fail(f"Test failed: {str(e)}")

@pytest.mark.gui
def test_token_tampering(main_window, qtbot, mocker):
    try:
        valid_token = generate_token("testuser")
        tampered_token = valid_token[:-1] + ('1' if valid_token[-1] == '0' else '0')
        main_window.current_token = tampered_token

        mock_middleware = mocker.patch('stojanovic_one.auth.middleware.JWTMiddleware.check_auth', return_value=False)

        def check_condition():
            main_window.show_logout_form()
            return main_window.stacked_widget.currentWidget() == main_window.welcome_page

        qtbot.waitUntil(check_condition, timeout=5000)
        
        mock_middleware.assert_called_once_with(tampered_token)
        
        assert main_window.stacked_widget.currentWidget() == main_window.welcome_page
        assert main_window.current_token is None

    except Exception as e:
        logging.error(f"Error in test_token_tampering: {str(e)}")
        logging.error(traceback.format_exc())
        pytest.fail(f"Test failed: {str(e)}")

@pytest.mark.gui
def test_password_hashing(main_window, qtbot, mocker):
    try:
        hashed_password = [None]
        def mock_register(conn, username, email, password):
            hashed_password[0] = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
            return True

        mocker.patch.object(main_window, '_register_user_func', side_effect=mock_register)

        result, error_message = main_window.register_user("newuser", "newuser@example.com", "password123")

        assert result == True, f"Registration failed, result: {result}, error: {error_message}"
        assert error_message is None, f"Unexpected error message: {error_message}"
        assert hashed_password[0] != "password123"
        assert hashed_password[0].startswith(b'$2b$')

    except Exception as e:
        logging.error(f"Error in test_password_hashing: {str(e)}")
        pytest.fail(f"Test failed: {str(e)}")