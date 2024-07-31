# tests/test_main.py

import pytest
from stojanovic_one.main import main
from PySide6.QtWidgets import QApplication

def test_main(qtbot):
    """
    Test the main function of the application.

    This test ensures that:
    1. The main function runs without errors in test mode.
    2. The RegistrationForm is created and visible.

    Args:
        qtbot: A QtBot instance provided by pytest-qt for GUI testing.
    """
    # Run the main function in test mode
    main(test_mode=True)

    # Check if the RegistrationForm is created and visible
    registration_form = None
    for widget in QApplication.topLevelWidgets():
        if widget.__class__.__name__ == 'RegistrationForm':
            registration_form = widget
            break

    assert registration_form is not None, "RegistrationForm was not created"
    assert registration_form.isVisible(), "RegistrationForm is not visible"

    # You can add more assertions here to check the initial state of the form if needed