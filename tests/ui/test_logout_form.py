# tests/ui/test_logout_form.py

import pytest
from PySide6.QtCore import Qt
from stojanovic_one.ui.logout_form import LogoutForm

@pytest.mark.gui
def test_logout_form_initial_state(qtbot):
    """
    Test the initial state of the logout form.

    This test ensures that:
    1. The form is created successfully.
    2. The logout button has the correct text.
    3. The message label is initially empty.

    Args:
        qtbot: A QtBot instance provided by pytest-qt for GUI testing.
    """
    widget = LogoutForm(token="test_token")
    qtbot.addWidget(widget)

    assert widget.logout_button.text() == "Logout"
    assert widget.message_label.text() == ""

@pytest.mark.gui
def test_logout_form_successful_logout(qtbot, mocker):
    """
    Test the logout form behavior when logout is successful.

    This test verifies that:
    1. The logout function is called with the correct token.
    2. A success message is displayed after logout.

    Args:
        qtbot: A QtBot instance provided by pytest-qt for GUI testing.
        mocker: A pytest-mock fixture for creating mock objects.
    """
    mock_logout = mocker.Mock(return_value=True)
    widget = LogoutForm(logout_user_func=mock_logout, token="test_token")
    qtbot.addWidget(widget)

    # Click the logout button
    qtbot.mouseClick(widget.logout_button, Qt.LeftButton)

    # Check if logout_user was called with the correct token
    mock_logout.assert_called_once_with("test_token")

    # Check if success message is displayed
    assert widget.message_label.text() == "Logout successful!"

@pytest.mark.gui
def test_logout_form_failed_logout(qtbot, mocker):
    """
    Test the logout form behavior when logout fails.

    This test verifies that:
    1. The logout function is called with the correct token.
    2. An error message is displayed when logout fails.

    Args:
        qtbot: A QtBot instance provided by pytest-qt for GUI testing.
        mocker: A pytest-mock fixture for creating mock objects.
    """
    mock_logout = mocker.Mock(return_value=False)
    widget = LogoutForm(logout_user_func=mock_logout, token="test_token")
    qtbot.addWidget(widget)

    # Click the logout button
    qtbot.mouseClick(widget.logout_button, Qt.LeftButton)

    # Check if logout_user was called with the correct token
    mock_logout.assert_called_once_with("test_token")

    # Check if error message is displayed
    assert widget.message_label.text() == "Logout failed. Please try again."

@pytest.mark.gui
def test_logout_form_no_active_session(qtbot):
    """
    Test the logout form behavior when there's no active session.

    This test ensures that:
    1. An appropriate message is displayed when attempting to logout without an active session.

    Args:
        qtbot: A QtBot instance provided by pytest-qt for GUI testing.
    """
    widget = LogoutForm(token=None)
    qtbot.addWidget(widget)

    # Click the logout button
    qtbot.mouseClick(widget.logout_button, Qt.LeftButton)

    # Check if the correct message is displayed
    assert widget.message_label.text() == "No active session. Please log in first."