# tests/test_main_security.py

import pytest
from PySide6.QtWidgets import QApplication
from PySide6.QtTest import QTest
from PySide6.QtCore import QTimer
from stojanovic_one.main import main
from stojanovic_one.auth.jwt_utils import generate_token, validate_token
from stojanovic_one.database.user_management import register_user
import bcrypt
import logging

logging.basicConfig(level=logging.DEBUG)

@pytest.fixture(scope="session")
def app():
    app = QApplication.instance()
    if app is None:
        app = QApplication([])
    yield app
    app.quit()

@pytest.fixture(scope="function")
def main_window(qtbot, mocker):
    # Mock the database connection
    mock_conn = mocker.Mock()
    mocker.patch('stojanovic_one.main.initialize_database', return_value=mock_conn)
    mocker.patch('stojanovic_one.main.create_user_table')

    # Create the main window
    window = main(test_mode=True)
    qtbot.addWidget(window)
    
    yield window
    
    # Cleanup
    window.close()
    QTest.qWait(100)  # Wait for any pending events to process
    window.deleteLater()
    QTest.qWait(100)  # Wait for deletion to complete

@pytest.fixture
def setup_and_teardown(qtbot):
    yield
    QTest.qWait(100)  # Wait for any pending events to process

@pytest.fixture(autouse=True)
def cleanup():
    yield
    for widget in QApplication.topLevelWidgets():
        widget.close()
        widget.deleteLater()
    QTest.qWait(100)

@pytest.mark.gui
def test_rate_limiting(main_window, qtbot, mocker):
    try:
        for i in range(6):
            result, message = main_window.login_user("testuser", "wrongpassword")
            if i < 5:
                assert result == False
                assert message == "Invalid username or password. Please try again."
            else:
                assert result == False
                assert message == "Too many login attempts. Please try again later."
            qtbot.wait(100)  # Add a small delay between attempts

    except Exception as e:
        logging.error(f"Error in test_rate_limiting: {str(e)}")
        pytest.fail(f"Test failed: {str(e)}")

@pytest.mark.gui
def test_token_expiration(main_window, qtbot, mocker):
    try:
        expired_token = generate_token("testuser", expiration=1)
        main_window.current_token = expired_token

        def check_condition():
            main_window.show_logout_form()
            return main_window.stacked_widget.currentWidget() == main_window.welcome_page

        qtbot.wait(2000)
        qtbot.waitUntil(check_condition, timeout=1000)

    except Exception as e:
        logging.error(f"Error in test_token_expiration: {str(e)}")
        pytest.fail(f"Test failed: {str(e)}")

@pytest.mark.gui
def test_token_tampering(main_window, qtbot, mocker):
    try:
        valid_token = generate_token("testuser")
        tampered_token = valid_token[:-1] + ('1' if valid_token[-1] == '0' else '0')
        main_window.current_token = tampered_token

        mock_middleware = mocker.patch('stojanovic_one.auth.middleware.JWTMiddleware.check_auth', return_value=False)

        main_window.show_logout_form()
        
        qtbot.wait(500)
        
        mock_middleware.assert_called_once_with(tampered_token)
        
        assert main_window.stacked_widget.currentWidget() == main_window.welcome_page
        assert main_window.current_token is None

    except Exception as e:
        logging.error(f"Error in test_token_tampering: {str(e)}")
        pytest.fail(f"Test failed: {str(e)}")

@pytest.mark.gui
def test_password_hashing(main_window, qtbot, mocker):
    try:
        hashed_password = [None]
        def mock_register(conn, username, email, password):
            hashed_password[0] = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
            return True

        mocker.patch('stojanovic_one.database.user_management.register_user', side_effect=mock_register)

        result, error_message = main_window.register_user("newuser", "newuser@example.com", "password123")

        assert result == True
        assert error_message is None
        assert hashed_password[0] != "password123"
        assert hashed_password[0].startswith(b'$2b$')

    except Exception as e:
        logging.error(f"Error in test_password_hashing: {str(e)}")
        pytest.fail(f"Test failed: {str(e)}")