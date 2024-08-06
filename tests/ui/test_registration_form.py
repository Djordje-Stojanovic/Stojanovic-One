# tests/ui/test_registration_form.py

import pytest
from PySide6.QtCore import Qt
from stojanovic_one.ui.registration_form import RegistrationForm

def mock_register_user_func(username, email, password):
    # For debugging, print the input values
    print(f"Mock register called with: {username}, {email}, {password}")
    return True

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

    # For debugging, print the final state of the form
    print(f"Username: {widget.username_input.text()}")
    print(f"Email: {widget.email_input.text()}")
    print(f"Password: {widget.password_input.text()}")
    print(f"Message: {widget.message_label.text()}")