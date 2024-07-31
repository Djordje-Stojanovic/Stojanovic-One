# tests/ui/test_registration_form.py

import sys
import pytest
from PySide6.QtWidgets import QApplication
from PySide6.QtTest import QTest
from PySide6.QtCore import Qt
from stojanovic_one.ui.registration_form import RegistrationForm

@pytest.fixture
def app(qtbot):
    test_app = QApplication.instance()
    if not test_app:
        test_app = QApplication(sys.argv)
    yield test_app
    test_app.quit()

@pytest.fixture
def registration_form(app, qtbot):
    widget = RegistrationForm()
    qtbot.addWidget(widget)
    return widget

def test_registration_form_initial_state(registration_form):
    assert registration_form.username_input.text() == ""
    assert registration_form.email_input.text() == ""
    assert registration_form.password_input.text() == ""
    assert not registration_form.register_button.isEnabled()

def test_registration_form_input_validation(qtbot, registration_form):
    # Fill in valid data
    qtbot.keyClicks(registration_form.username_input, "testuser")
    qtbot.keyClicks(registration_form.email_input, "test@example.com")
    qtbot.keyClicks(registration_form.password_input, "password123")

    # Check if register button is enabled
    assert registration_form.register_button.isEnabled()

    # Clear email field (should disable register button)
    registration_form.email_input.clear()
    assert not registration_form.register_button.isEnabled()

def test_registration_form_submission(qtbot, registration_form, mocker):
    # Mock the register_user function
    mock_register = mocker.patch('stojanovic_one.database.user_management.register_user', return_value=True)

    # Fill in valid data
    qtbot.keyClicks(registration_form.username_input, "testuser")
    qtbot.keyClicks(registration_form.email_input, "test@example.com")
    qtbot.keyClicks(registration_form.password_input, "password123")

    # Click the register button
    qtbot.mouseClick(registration_form.register_button, Qt.LeftButton)

    # Check if register_user was called with correct arguments
    mock_register.assert_called_once_with(
        mocker.ANY,
        "testuser",
        "test@example.com",
        "password123"
    )

    # Check if success message is displayed (you'll need to implement this in the form)
    assert registration_form.message_label.text() == "Registration successful!"