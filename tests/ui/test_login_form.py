# tests/ui/test_login_form.py

import pytest
from PySide6.QtCore import Qt
from stojanovic_one.ui.login_form import LoginForm

def mock_login_func(username, password):
    if username == "testuser" and password == "password":
        return True, None
    return False, "Invalid username or password. Please try again."

@pytest.mark.gui
def test_login_form_initial_state(qtbot):
    widget = LoginForm(login_user_func=mock_login_func)
    qtbot.addWidget(widget)

    assert widget.username_input.text() == ""
    assert widget.password_input.text() == ""
    assert widget.login_button.text() == "Login"

@pytest.mark.gui
def test_login_form_input_validation(qtbot):
    widget = LoginForm(login_user_func=mock_login_func)
    qtbot.addWidget(widget)

    # Fill in valid data
    qtbot.keyClicks(widget.username_input, "testuser")
    qtbot.keyClicks(widget.password_input, "password")

    # Trigger login
    qtbot.mouseClick(widget.login_button, Qt.LeftButton)

    assert widget.message_label.text() == "Login successful!"

@pytest.mark.gui
def test_login_form_submission(qtbot, mocker):
    mock_login = mocker.Mock(return_value=(True, None))
    widget = LoginForm(login_user_func=mock_login)
    qtbot.addWidget(widget)

    # Fill in valid data
    qtbot.keyClicks(widget.username_input, "testuser")
    qtbot.keyClicks(widget.password_input, "password123")

    # Click the login button
    qtbot.mouseClick(widget.login_button, Qt.LeftButton)

    # Check if login_user was called with correct arguments
    mock_login.assert_called_once_with("testuser", "password123")

    # Check if success message is displayed
    assert widget.message_label.text() == "Login successful!"

@pytest.mark.gui
def test_login_form_failed_login(qtbot, mocker):
    mock_login = mocker.Mock(return_value=(False, "Invalid username or password. Please try again."))
    widget = LoginForm(login_user_func=mock_login)
    qtbot.addWidget(widget)

    # Fill in invalid data
    qtbot.keyClicks(widget.username_input, "testuser")
    qtbot.keyClicks(widget.password_input, "wrongpassword")

    # Click the login button
    qtbot.mouseClick(widget.login_button, Qt.LeftButton)

    # Check if error message is displayed
    assert widget.message_label.text() == "Invalid username or password. Please try again."