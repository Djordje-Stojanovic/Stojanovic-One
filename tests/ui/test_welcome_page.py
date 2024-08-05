# tests/ui/test_welcome_page.py

import pytest
from PySide6.QtCore import Qt, QTimer
from PySide6.QtTest import QSignalSpy, QTest
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
    welcome_page.show()  # Make sure the widget is shown

    # Test large window size
    welcome_page.resize(1000, 800)
    qtbot.wait(300)  # Increased wait time
    assert welcome_page.welcome_label.font().pointSize() == 24
    assert welcome_page.login_button.width() == 200

    # Test small window size
    welcome_page.resize(400, 300)
    qtbot.wait(300)  # Increased wait time
    assert welcome_page.welcome_label.font().pointSize() == 20
    assert welcome_page.login_button.width() == 320

    # Force processing of pending events
    QTimer.singleShot(0, lambda: None)
    qtbot.wait(200)  # Increased wait time

@pytest.mark.gui
def test_welcome_page_button_clicks(qtbot):
    welcome_page = WelcomePage()
    qtbot.addWidget(welcome_page)

    with qtbot.waitSignal(welcome_page.login_clicked, timeout=1000) as blocker:
        qtbot.mouseClick(welcome_page.login_button, Qt.LeftButton)
    assert blocker.signal_triggered

    with qtbot.waitSignal(welcome_page.register_clicked, timeout=1000) as blocker:
        qtbot.mouseClick(welcome_page.register_button, Qt.LeftButton)
    assert blocker.signal_triggered

@pytest.mark.gui
def test_welcome_page_logout_button(qtbot):
    welcome_page = WelcomePage()
    qtbot.addWidget(welcome_page)

    # Initially, logout button should be hidden
    assert not welcome_page.logout_button.isVisible()

    # Simulate login
    welcome_page.update_ui_after_login(True)
    qtbot.wait(500)  # Increase wait time for UI update
    
    assert welcome_page.logout_button.isVisible()
    assert not welcome_page.login_button.isVisible()
    assert not welcome_page.register_button.isVisible()

    # Simulate logout
    welcome_page.update_ui_after_login(False)
    qtbot.wait(500)  # Increase wait time for UI update
    
    assert not welcome_page.logout_button.isVisible()
    assert welcome_page.login_button.isVisible()
    assert welcome_page.register_button.isVisible()

@pytest.mark.gui
def test_welcome_page_styling(qtbot):
    welcome_page = WelcomePage()
    qtbot.addWidget(welcome_page)

    assert "background-color: #f0f0f0;" in welcome_page.styleSheet()
    assert "color: #2c3e50;" in welcome_page.welcome_label.styleSheet()
    assert "color: #34495e;" in welcome_page.description_label.styleSheet()
    assert "background-color: #3498db;" in welcome_page.login_button.styleSheet()
    assert "background-color: #2ecc71;" in welcome_page.register_button.styleSheet()

@pytest.mark.gui
def test_welcome_page_delayed_resize(qtbot):
    welcome_page = WelcomePage()
    qtbot.addWidget(welcome_page)
    welcome_page.show()

    # Trigger a resize event
    welcome_page.resize(800, 600)
    
    # Wait for the delayed resize to occur
    qtbot.wait(1000)

    assert welcome_page.welcome_label.font().pointSize() == 24
    assert welcome_page.description_label.font().pointSize() == 16

    # Test small window size
    welcome_page.resize(400, 300)
    
    # Wait for the delayed resize to occur
    qtbot.wait(1000)

    assert welcome_page.welcome_label.font().pointSize() == 20
    assert welcome_page.description_label.font().pointSize() == 12