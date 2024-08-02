# tests/ui/test_logout_form.py

import pytest
from PySide6.QtCore import Qt
from stojanovic_one.ui.logout_form import LogoutForm

@pytest.mark.gui
def test_logout_form_initial_state(qtbot):
    """
    Test the initial state of the logout form.
    """
    widget = LogoutForm()
    qtbot.addWidget(widget)

    assert widget.logout_button.text() == "Logout"
    assert widget.message_label.text() == ""

@pytest.mark.gui
def test_logout_form_successful_logout(qtbot, mocker):
    """
    Test the logout form behavior when logout is successful.
    """
    mock_logout = mocker.Mock(return_value=True)
    widget = LogoutForm(logout_user_func=mock_logout)
    qtbot.addWidget(widget)

    # Click the logout button
    qtbot.mouseClick(widget.logout_button, Qt.LeftButton)

    # Check if logout_user was called
    mock_logout.assert_called_once()

    # Check if success message is displayed
    assert widget.message_label.text() == "Logout successful!"

@pytest.mark.gui
def test_logout_form_failed_logout(qtbot, mocker):
    """
    Test the logout form behavior when logout fails.
    """
    mock_logout = mocker.Mock(return_value=False)
    widget = LogoutForm(logout_user_func=mock_logout)
    qtbot.addWidget(widget)

    # Click the logout button
    qtbot.mouseClick(widget.logout_button, Qt.LeftButton)

    # Check if logout_user was called
    mock_logout.assert_called_once()

    # Check if error message is displayed
    assert widget.message_label.text() == "Logout failed. Please try again."