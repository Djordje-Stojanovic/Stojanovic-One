# tests/ui/test_registration_form.py

"""
This module contains test cases for the RegistrationForm GUI component.

These tests cover the initial state of the form, input validation,
and form submission functionality. They use pytest and pytest-qt
for GUI testing.
"""

import pytest
from PySide6.QtWidgets import QApplication
from PySide6.QtCore import Qt
from stojanovic_one.ui.registration_form import RegistrationForm

@pytest.mark.gui
def test_registration_form_initial_state(qtbot):
    """
    Test the initial state of the registration form.

    This test ensures that:
    1. The form is created successfully.
    2. All input fields are initially empty.
    3. The register button is disabled at start.

    Args:
        qtbot: A QtBot instance provided by pytest-qt for GUI testing.
    """
    widget = RegistrationForm()
    qtbot.addWidget(widget)
    assert widget.username_input.text() == ""
    assert widget.email_input.text() == ""
    assert widget.password_input.text() == ""
    assert not widget.register_button.isEnabled()

@pytest.mark.gui
def test_registration_form_input_validation(qtbot):
    """
    Test input validation for the registration form.

    This test verifies that:
    1. The register button is enabled when all fields are filled.
    2. The register button is disabled when any field is cleared.

    Args:
        qtbot: A QtBot instance provided by pytest-qt for GUI testing.
    """
    widget = RegistrationForm()
    qtbot.addWidget(widget)
    # Fill in valid data
    qtbot.keyClicks(widget.username_input, "testuser")
    qtbot.keyClicks(widget.email_input, "test@example.com")
    qtbot.keyClicks(widget.password_input, "password123")

    # Check if register button is enabled
    assert widget.register_button.isEnabled()

    # Clear email field (should disable register button)
    widget.email_input.clear()
    assert not widget.register_button.isEnabled()

@pytest.mark.gui
def test_registration_form_submission(qtbot, mocker):
    """
    Test the submission of the registration form.

    This test ensures that:
    1. The form can be submitted when all fields are filled.
    2. The register_user function is called with correct arguments.
    3. A success message is displayed after successful submission.

    Args:
        qtbot: A QtBot instance provided by pytest-qt for GUI testing.
        mocker: A pytest-mock fixture for creating mock objects.
    """
    mock_register = mocker.Mock(return_value=True)
    widget = RegistrationForm(register_user_func=mock_register)
    qtbot.addWidget(widget)

    # Fill in valid data
    qtbot.keyClicks(widget.username_input, "testuser")
    qtbot.keyClicks(widget.email_input, "test@example.com")
    qtbot.keyClicks(widget.password_input, "password123")

    # Check if the register button is enabled
    assert widget.register_button.isEnabled(), "Register button is not enabled"

    # Click the register button
    qtbot.mouseClick(widget.register_button, Qt.LeftButton)

    # Add a small delay to allow for event processing
    qtbot.wait(100)

    print(f"Message label text: {widget.message_label.text()}")  # Debug print

    # Check if register_user was called with correct arguments
    mock_register.assert_called_once_with(
        "testuser",
        "test@example.com",
        "password123"
    )

    # Check if success message is displayed
    assert widget.message_label.text() == "Registration successful!"