# tests/ui/test_registration_form.py

import pytest
from PySide6.QtCore import Qt
from stojanovic_one.ui.registration_form import RegistrationForm

def mock_register_user_func(username, email, password):
    return True

@pytest.mark.gui
def test_registration_form_initial_state(qtbot):
    widget = RegistrationForm(register_user_func=mock_register_user_func)
    qtbot.addWidget(widget)

    assert widget.username_input.text() == ""
    assert widget.email_input.text() == ""
    assert widget.password_input.text() == ""
    assert widget.register_button.text() == "Register"

@pytest.mark.gui
def test_registration_form_submission(qtbot):
    widget = RegistrationForm(register_user_func=mock_register_user_func)
    qtbot.addWidget(widget)

    # Fill in valid data
    qtbot.keyClicks(widget.username_input, "testuser")
    qtbot.keyClicks(widget.email_input, "test@example.com")
    qtbot.keyClicks(widget.password_input, "password123")

    # Click the register button
    with qtbot.waitSignal(widget.registration_successful, timeout=1000):
        qtbot.mouseClick(widget.register_button, Qt.LeftButton)

    # Check if success message is displayed
    assert widget.message_label.text() == "Registration successful!"