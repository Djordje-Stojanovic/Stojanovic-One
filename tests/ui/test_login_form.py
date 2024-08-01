# tests/ui/test_login_form.py

import pytest
from PySide6.QtCore import Qt
from stojanovic_one.ui.login_form import LoginForm

@pytest.mark.gui
def test_login_form_initial_state(qtbot):
    """
    Test the initial state of the login form.
    """
    widget = LoginForm()
    qtbot.addWidget(widget)

    assert widget.username_input.text() == ""
    assert widget.password_input.text() == ""
    assert not widget.login_button.isEnabled()

@pytest.mark.gui
def test_login_form_input_validation(qtbot):
    """
    Test input validation for the login form.
    """
    widget = LoginForm()
    qtbot.addWidget(widget)

    # Fill in valid data
    qtbot.keyClicks(widget.username_input, "testuser")
    qtbot.keyClicks(widget.password_input, "password123")

    # Check if login button is enabled
    assert widget.login_button.isEnabled()

    # Clear username field (should disable login button)
    widget.username_input.clear()
    assert not widget.login_button.isEnabled()

@pytest.mark.gui
def test_login_form_submission(qtbot, mocker):
    """
    Test the submission of the login form.
    """
    mock_login = mocker.Mock(return_value="fake_jwt_token")
    widget = LoginForm(login_user_func=mock_login)
    qtbot.addWidget(widget)

    # Fill in valid data
    qtbot.keyClicks(widget.username_input, "testuser")
    qtbot.keyClicks(widget.password_input, "password123")

    # Click the login button
    qtbot.mouseClick(widget.login_button, Qt.LeftButton)

    # Check if login_user was called with correct arguments
    mock_login.assert_called_once_with("testuser", "password123")

    # Check if success message is displayed and token is stored
    assert widget.message_label.text() == "Login successful!"
    assert widget.token == "fake_jwt_token"

@pytest.mark.gui
def test_login_form_failed_login(qtbot, mocker):
    """
    Test the login form behavior when login fails.
    """
    mock_login = mocker.Mock(return_value=None)
    widget = LoginForm(login_user_func=mock_login)
    qtbot.addWidget(widget)

    # Fill in invalid data
    qtbot.keyClicks(widget.username_input, "testuser")
    qtbot.keyClicks(widget.password_input, "wrongpassword")

    # Click the login button
    qtbot.mouseClick(widget.login_button, Qt.LeftButton)

    # Check if error message is displayed and token is None
    assert widget.message_label.text() == "Login failed. Please try again."
    assert widget.token is None