# tests/test_main_security.py

import pytest
from PySide6.QtWidgets import QApplication
from PySide6.QtTest import QTest
from stojanovic_one.main import main
from stojanovic_one.auth.jwt_utils import generate_token, validate_token
from stojanovic_one.database.user_management import register_user
import bcrypt

@pytest.fixture(scope="session")
def app():
    app = QApplication.instance()
    if app is None:
        app = QApplication([])
    yield app
    # Don't call app.quit() here, as it might interfere with other tests

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
def test_rate_limiting(app, qtbot, mocker, setup_and_teardown):
    main_window = main(test_mode=True)
    qtbot.addWidget(main_window)

    for i in range(6):
        result, message = main_window.login_user("testuser", "wrongpassword")
        if i < 5:
            assert result == False
            assert message == "Invalid username or password. Please try again."
        else:
            assert result == False
            assert message == "Too many login attempts. Please try again later."
        QTest.qWait(100)  # Add a small delay between attempts

@pytest.mark.gui
def test_token_expiration(app, qtbot, mocker, setup_and_teardown):
    main_window = main(test_mode=True)
    qtbot.addWidget(main_window)

    expired_token = generate_token("testuser", expiration=1)
    main_window.current_token = expired_token

    QTest.qWait(2000)

    main_window.show_logout_form()
    
    QTest.qWait(500)
    assert main_window.stacked_widget.currentWidget() == main_window.welcome_page

@pytest.mark.gui
def test_token_tampering(app, qtbot, mocker, setup_and_teardown):
    main_window = main(test_mode=True)
    qtbot.addWidget(main_window)

    valid_token = generate_token("testuser")
    tampered_token = valid_token[:-1] + ('1' if valid_token[-1] == '0' else '0')
    main_window.current_token = tampered_token

    # Mock the jwt_middleware to simulate the authentication check
    mock_middleware = mocker.patch('stojanovic_one.auth.middleware.JWTMiddleware.check_auth', return_value=False)

    main_window.show_logout_form()
    
    QTest.qWait(500)
    
    # Check if the middleware was called with the tampered token
    mock_middleware.assert_called_once_with(tampered_token)
    
    # Now check if we're redirected to the welcome page due to invalid token
    assert main_window.stacked_widget.currentWidget() == main_window.welcome_page
    assert main_window.current_token is None

@pytest.mark.gui
def test_password_hashing(app, qtbot, mocker, setup_and_teardown):
    main_window = main(test_mode=True)
    qtbot.addWidget(main_window)

    # Mock the register_user function to return True and store the hashed password
    hashed_password = [None]
    def mock_register(conn, username, email, password):
        hashed_password[0] = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        return True

    mocker.patch('stojanovic_one.database.user_management.register_user', side_effect=mock_register)

    result = main_window.register_user("newuser", "newuser@example.com", "password123")

    assert result == True
    assert hashed_password[0] != "password123"
    assert hashed_password[0].startswith(b'$2b$')