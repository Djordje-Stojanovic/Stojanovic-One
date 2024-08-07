# tests/conftest.py

import pytest
from PySide6.QtWidgets import QApplication
from PySide6.QtCore import Qt
from PySide6.QtTest import QTest
import logging
from datetime import datetime

def pytest_configure(config):
    QApplication.setAttribute(Qt.AA_ShareOpenGLContexts)
    logging.basicConfig(filename=f'test_errors_{datetime.now().strftime("%Y%m%d_%H%M%S")}.log', level=logging.DEBUG)

@pytest.fixture(scope="session")
def qapp():
    app = QApplication.instance()
    if app is None:
        app = QApplication([])
    yield app
    app.processEvents()
    app.quit()

@pytest.fixture(autouse=True)
def qtest_setup(qapp):
    QTest.qWait(0)  # Process pending events before each test
    yield
    QTest.qWait(0)  # Process pending events after each test

@pytest.fixture(autouse=True)
def cleanup_widgets(qapp):
    yield
    for widget in qapp.topLevelWidgets():
        if widget.isWindow():
            widget.close()
        widget.deleteLater()
    qapp.processEvents()
    QTest.qWait(100)  # Wait for deletion to complete

@pytest.hookimpl(tryfirst=True, hookwrapper=True)
def pytest_runtest_makereport(item, call):
    outcome = yield
    rep = outcome.get_result()
    if rep.when == "call" and rep.failed:
        logging.error(f"Test failed: {item.nodeid}")
        if call.excinfo:
            logging.error(f"Exception: {call.excinfo.value}")
            logging.error(f"Traceback: {call.excinfo.traceback}")

@pytest.fixture(autouse=True)
def run_around_tests(qapp):
    yield
    qapp.processEvents()
    QTest.qWait(100)

@pytest.fixture(autouse=True)
def close_widgets(qapp):
    yield
    for widget in QApplication.topLevelWidgets():
        if widget.isWindow():
            widget.close()
        widget.deleteLater()
    qapp.processEvents()
    QTest.qWait(1000)  # Increased wait time