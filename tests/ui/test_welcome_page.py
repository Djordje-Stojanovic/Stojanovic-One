# tests/ui/test_welcome_page.py

import pytest
from PySide6.QtCore import Qt
from PySide6.QtTest import QSignalSpy
from stojanovic_one.ui.welcome_page import WelcomePage

@pytest.mark.gui
def test_welcome_page_initial_state(qtbot):
    welcome_page = WelcomePage()
    qtbot.addWidget(welcome_page)

    assert welcome_page.windowTitle() == "Welcome to Stojanovic-One"
    assert welcome_page.login_button.text() == "Login"
    assert welcome_page.register_button.text() == "Register"

@pytest.mark.gui
def test_welcome_page_responsiveness(qtbot):
    welcome_page = WelcomePage()
    qtbot.addWidget(welcome_page)

    # Test large window size
    welcome_page.resize(1000, 800)
    qtbot.wait(200)
    assert welcome_page.welcome_label.font().pointSize() == 24
    assert welcome_page.login_button.width() == 200

    # Test small window size
    welcome_page.resize(400, 300)
    qtbot.wait(200)
    assert welcome_page.welcome_label.font().pointSize() == 20
    assert welcome_page.login_button.width() == 320

@pytest.mark.gui
def test_welcome_page_button_clicks(qtbot):
    welcome_page = WelcomePage()
    qtbot.addWidget(welcome_page)

    login_spy = QSignalSpy(welcome_page.login_clicked)
    register_spy = QSignalSpy(welcome_page.register_clicked)

    qtbot.mouseClick(welcome_page.login_button, Qt.LeftButton)
    assert len(login_spy) == 1

    qtbot.mouseClick(welcome_page.register_button, Qt.LeftButton)
    assert len(register_spy) == 1

@pytest.mark.gui
def test_welcome_page_styling(qtbot):
    welcome_page = WelcomePage()
    qtbot.addWidget(welcome_page)

    assert "background-color: #f0f0f0;" in welcome_page.styleSheet()
    assert "color: #2c3e50;" in welcome_page.welcome_label.styleSheet()
    assert "color: #34495e;" in welcome_page.description_label.styleSheet()
    assert "background-color: #3498db;" in welcome_page.login_button.styleSheet()
    assert "background-color: #2ecc71;" in welcome_page.register_button.styleSheet()