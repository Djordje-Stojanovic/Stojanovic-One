# tests/test_main.py

import pytest
import sys
from unittest.mock import MagicMock
from PySide6 import __version__ as PYSIDE_VERSION
from PySide6.QtWidgets import QApplication
from PySide6.QtCore import QLibraryInfo
from stojanovic_one.main import main
from stojanovic_one.ui.registration_form import RegistrationForm  # Add this import

@pytest.fixture
def mock_qapp(monkeypatch):
    mock_app = MagicMock(spec=QApplication)
    mock_app.topLevelWidgets.return_value = []
    monkeypatch.setattr(QApplication, 'instance', lambda: mock_app)
    return mock_app

def test_main(qtbot, capfd):
    """
    Test the main function of the application.

    This test ensures that:
    1. The main function runs without errors in test mode.
    2. The RegistrationForm is created and visible.

    Args:
        qtbot: A QtBot instance provided by pytest-qt for GUI testing.
        capfd: A pytest fixture to capture stdout and stderr
    """
    print("Starting test_main")
    print(f"Python version: {sys.version}")
    print(f"PySide6 version: {PYSIDE_VERSION}")
    print(f"Qt version: {QLibraryInfo.version().toString()}")
    
    # Run the main function in test mode
    result = main(test_mode=True)

    # Check if the result is None (as expected in test mode)
    assert result is None, "main function should return None in test mode"

    # Check if the RegistrationForm is created and visible
    registration_form = None
    for widget in QApplication.topLevelWidgets():
        if isinstance(widget, RegistrationForm):
            registration_form = widget
            break

    assert registration_form is not None, "RegistrationForm was not created"
    assert registration_form.isVisible(), "RegistrationForm is not visible"

    # Capture and print any output
    out, err = capfd.readouterr()
    print(f"Stdout: {out}")
    print(f"Stderr: {err}")

def test_main_function_exists():
    """
    Test that the main function exists.
    """
    assert callable(main), "main function should be callable"

def test_main_returns_none():
    """
    Test that the main function returns None when run in test mode.
    """
    result = main(test_mode=True)
    assert result is None, "main function should return None in test mode"