# tests/test_main.py

import pytest
from PySide6.QtWidgets import QApplication
from PySide6.QtCore import Qt, QTimer
from PySide6.QtTest import QTest
from stojanovic_one.main import main, MainWindow
import traceback
from stojanovic_one.auth.jwt_utils import generate_token
import logging

logging.basicConfig(level=logging.DEBUG)

@pytest.fixture(scope="session")
def qapp():
    app = QApplication.instance()
    if app is None:
        app = QApplication([])
    yield app
    app.quit()

@pytest.fixture(scope="function")
def main_window(qapp, qtbot, mocker):
    logging.info("main_window fixture: setup started")
    mock_conn = mocker.Mock()
    mocker.patch('stojanovic_one.main.initialize_database', return_value=mock_conn)
    mocker.patch('stojanovic_one.main.create_user_table')

    window = MainWindow(mock_conn, test_mode=True)
    window.show()
    qtbot.addWidget(window)
    qtbot.waitForWindowShown(window)
    
    logging.info("main_window fixture: setup completed")
    yield window
    
    logging.info("main_window fixture: teardown started")
    window.cleanup()
    window.close()
    window.deleteLater()
    qapp.processEvents()
    logging.info("main_window fixture: teardown completed")

@pytest.fixture
def setup_and_teardown(qtbot):
    yield
    QTest.qWait(100)  # Wait for any pending events to process

@pytest.mark.gui
def test_main(main_window, qtbot):
    assert isinstance(main_window, MainWindow)
    assert main_window.isVisible()

    def check_welcome_page():
        assert main_window.stacked_widget.currentWidget() == main_window.welcome_page

    QTimer.singleShot(500, check_welcome_page)
    qtbot.wait(1000)

@pytest.mark.gui
def test_main_window_navigation(main_window, qtbot):
    # Test navigation to login form
    qtbot.mouseClick(main_window.welcome_page.login_button, Qt.LeftButton)
    qtbot.waitUntil(lambda: main_window.stacked_widget.currentWidget() == main_window.login_form, timeout=1000)

    # Test navigation to registration form
    main_window.show_welcome_page()
    qtbot.waitUntil(lambda: main_window.stacked_widget.currentWidget() == main_window.welcome_page, timeout=1000)
    qtbot.mouseClick(main_window.welcome_page.register_button, Qt.LeftButton)
    qtbot.waitUntil(lambda: main_window.stacked_widget.currentWidget() == main_window.registration_form, timeout=1000)

    # Test navigation back to welcome page after successful registration
    main_window.on_registration_successful()
    qtbot.waitUntil(lambda: main_window.stacked_widget.currentWidget() == main_window.welcome_page, timeout=1000)

@pytest.mark.gui
def test_login_logout_flow(main_window, qtbot, mocker):
    try:
        logging.debug("Starting test_login_logout_flow")

        mock_login = mocker.patch('stojanovic_one.database.user_management.login_user', return_value=("fake_token", None))
        logging.debug("Mock login created")

        result, _ = main_window.login_user("testuser", "password123")
        assert result == True
        assert main_window.current_token == "fake_token"
        logging.debug("Login assertions passed")

        mock_logout = mocker.patch('stojanovic_one.database.user_management.logout_user', return_value=True)
        success, _ = main_window.perform_logout()
        assert success == True
        assert mock_logout.called
        assert main_window.current_token is None
        logging.debug("Logout assertions passed")

    except Exception as e:
        logging.error(f"Test failed: {str(e)}")
        logging.error(traceback.format_exc())
        pytest.fail(f"Test failed due to exception: {str(e)}")

@pytest.mark.gui
def test_registration_flow(main_window, qtbot, mocker):
    try:
        logging.debug("Starting test_registration_flow")

        mock_register = mocker.patch('stojanovic_one.database.user_management.register_user', return_value=True)
        logging.debug("Mock register created")

        result, error_message = main_window.register_user("newuser", "newuser@example.com", "password123")
        logging.debug(f"Registration result: {result}")

        assert result == True
        assert error_message is None
        mock_register.assert_called_once_with(main_window.conn, "newuser", "newuser@example.com", "password123")

        logging.debug("Registration assertions passed")

    except Exception as e:
        logging.error(f"Test failed: {str(e)}")
        logging.error(traceback.format_exc())
        pytest.fail(f"Test failed due to exception: {str(e)}")

@pytest.mark.gui
def test_protected_routes(main_window, qtbot, mocker):
    try:
        main_window.show_logout_form()
        qtbot.waitUntil(lambda: main_window.stacked_widget.currentWidget() == main_window.welcome_page, timeout=1000)

        main_window.current_token = generate_token("testuser")

        main_window.show_logout_form()
        qtbot.waitUntil(lambda: main_window.stacked_widget.currentWidget() == main_window.logout_form, timeout=1000)

        mock_validate = mocker.patch('stojanovic_one.auth.jwt_utils.validate_token', return_value=None)
        
        main_window.handle_auth_failure()

        qtbot.waitUntil(lambda: main_window.stacked_widget.currentWidget() == main_window.welcome_page, timeout=1000)
        assert main_window.current_token is None

    except Exception as e:
        pytest.fail(f"Test failed due to exception: {str(e)}\n{traceback.format_exc()}")

@pytest.mark.gui
def test_auth_state_management(main_window, qtbot):
    try:
        logging.debug("Starting test_auth_state_management")

        assert not main_window.is_authenticated()
        logging.debug("Initial authentication state checked")

        main_window.current_token = "fake_token"
        assert main_window.is_authenticated()
        logging.debug("Authentication state after setting token checked")

        main_window.current_token = None
        assert not main_window.is_authenticated()
        logging.debug("Authentication state after removing token checked")

        def check_logged_in_state():
            return (main_window.welcome_page.logout_button.isVisible() and
                    not main_window.welcome_page.login_button.isVisible() and
                    not main_window.welcome_page.register_button.isVisible())

        def check_logged_out_state():
            return (not main_window.welcome_page.logout_button.isVisible() and
                    main_window.welcome_page.login_button.isVisible() and
                    main_window.welcome_page.register_button.isVisible())

        main_window.update_auth_state(True)
        qtbot.waitUntil(check_logged_in_state, timeout=1000)

        main_window.update_auth_state(False)
        qtbot.waitUntil(check_logged_out_state, timeout=1000)

        logging.debug("test_auth_state_management completed successfully")
    except Exception as e:
        logging.error(f"Test failed: {str(e)}")
        logging.error(traceback.format_exc())
        pytest.fail(f"Test failed due to exception: {str(e)}")

@pytest.mark.gui
def test_error_messages(main_window, qtbot, mocker):
    mocker.patch('stojanovic_one.database.user_management.login_user', return_value=(None, "Invalid username or password"))
    result, error_message = main_window.login_user("nonexistent", "wrongpassword")
    assert result == False
    assert error_message == "Invalid username or password. Please try again."

    mocker.patch('stojanovic_one.database.user_management.register_user', return_value=False)
    result, error_message = main_window.register_user("existinguser", "test@example.com", "password123")
    assert result == False
    assert error_message == "Registration failed. Username or email may already be in use."

    main_window.current_token = "fake_token"
    mocker.patch('stojanovic_one.database.user_management.logout_user', return_value=False)
    result, error_message = main_window.logout_user("fake_token")
    assert result == False
    assert error_message == "An error occurred during logout. Please try again."