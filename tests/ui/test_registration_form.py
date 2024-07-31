# tests/ui/test_registration_form.py

import pytest
from unittest.mock import MagicMock
from PySide6.QtWidgets import QApplication
from PySide6.QtCore import Qt
from stojanovic_one.ui.registration_form import RegistrationForm

@pytest.fixture
def mock_qapp(monkeypatch):
    mock_app = MagicMock(spec=QApplication)
    monkeypatch.setattr(QApplication, 'instance', lambda: mock_app)
    return mock_app

@pytest.fixture
def registration_form(mock_qapp, qtbot, mocker):
    mock_register = mocker.Mock(return_value=True)
    widget = RegistrationForm(register_user_func=mock_register)
    qtbot.addWidget(widget)
    return widget, mock_register

def test_registration_form_initial_state(registration_form):
    """Test the initial state of the registration form."""
    widget, _ = registration_form
    assert widget.username_input.text() == ""
    assert widget.email_input.text() == ""
    assert widget.password_input.text() == ""
    assert not widget.register_button.isEnabled()

def test_registration_form_input_validation(qtbot, registration_form):
    """Test input validation for the registration form."""
    widget, _ = registration_form
    # Fill in valid data
    qtbot.keyClicks(widget.username_input, "testuser")
    qtbot.keyClicks(widget.email_input, "test@example.com")
    qtbot.keyClicks(widget.password_input, "password123")

    # Check if register button is enabled
    assert widget.register_button.isEnabled()

    # Clear email field (should disable register button)
    widget.email_input.clear()
    assert not widget.register_button.isEnabled()

def test_registration_form_submission(qtbot, registration_form):
    """Test the submission of the registration form."""
    widget, mock_register = registration_form

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