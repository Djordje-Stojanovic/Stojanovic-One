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
def main_window(qtbot, mocker):
    # Mock the database connection
    mock_conn = mocker.Mock()
    mocker.patch('stojanovic_one.main.initialize_database', return_value=mock_conn)
    mocker.patch('stojanovic_one.main.create_user_table')

    # Create the main window
    window = main(test_mode=True)
    qtbot.addWidget(window)
    
    yield window
    
    # Cleanup
    window.close()
    QTest.qWait(100)  # Wait for any pending events to process
    window.deleteLater()
    QTest.qWait(100)  # Wait for deletion to complete

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
    qtbot.wait(500)
    assert main_window.stacked_widget.currentWidget() == main_window.login_form

    # Test navigation to registration form
    main_window.show_welcome_page()
    qtbot.wait(500)
    qtbot.mouseClick(main_window.welcome_page.register_button, Qt.LeftButton)
    qtbot.wait(500)
    assert main_window.stacked_widget.currentWidget() == main_window.registration_form

    # Test navigation back to welcome page after successful registration
    main_window.on_registration_successful()
    qtbot.wait(500)
    assert main_window.stacked_widget.currentWidget() == main_window.welcome_page

@pytest.mark.gui
def test_login_logout_flow(main_window, qtbot, mocker):
    try:
        logging.debug("Starting test_login_logout_flow")

        mock_login = mocker.patch('stojanovic_one.database.user_management.login_user', return_value="fake_token")
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
def test_registration_flow(qtbot, mocker):
    try:
        logging.debug("Starting test_registration_flow")
        main_window = main(test_mode=True)
        logging.debug("Main window created")
        qtbot.addWidget(main_window)

        mock_register = mocker.patch('stojanovic_one.database.user_management.register_user', return_value=True)
        logging.debug("Mock register created")

        # Directly call register_user method instead of interacting with GUI
        result, error_message = main_window.register_user("newuser", "newuser@example.com", "password123")
        logging.debug(f"Registration result: {result}")

        assert result == True
        assert error_message is None
        mock_register.assert_called_once()
        args = mock_register.call_args[0]
        assert args[0] == main_window.conn
        assert args[1] == "newuser"
        assert args[2] == "newuser@example.com"
        assert args[3] == "password123"  # Password should not be hashed at this point

        logging.debug("Registration assertions passed")

    except Exception as e:
        logging.error(f"Test failed: {str(e)}")
        logging.error(traceback.format_exc())
        pytest.fail(f"Test failed due to exception: {str(e)}")
    finally:
        # Ensure proper cleanup
        main_window.close()
        main_window.deleteLater()
        QTest.qWait(100)  # Give some time for cleanup

@pytest.mark.gui
def test_protected_routes(app, qtbot, mocker, setup_and_teardown):
    try:
        main_window = main(test_mode=True)
        qtbot.addWidget(main_window)

        main_window.show_logout_form()
        QTest.qWait(500)
        assert main_window.stacked_widget.currentWidget() == main_window.welcome_page

        main_window.current_token = generate_token("testuser")

        main_window.show_logout_form()
        QTest.qWait(500)
        assert main_window.stacked_widget.currentWidget() == main_window.logout_form

        mock_validate = mocker.patch('stojanovic_one.auth.jwt_utils.validate_token', return_value=None)
        
        main_window.handle_auth_failure()

        QTest.qWait(500)

        assert main_window.stacked_widget.currentWidget() == main_window.welcome_page
        assert main_window.current_token is None

    except Exception as e:
        pytest.fail(f"Test failed due to exception: {str(e)}\n{traceback.format_exc()}")

@pytest.mark.gui
def test_auth_state_management(app, qtbot, setup_and_teardown):
    try:
        logging.debug("Starting test_auth_state_management")
        main_window = main(test_mode=True)
        logging.debug("Main window created")
        qtbot.addWidget(main_window)

        assert not main_window.is_authenticated()
        logging.debug("Initial authentication state checked")

        main_window.current_token = "fake_token"
        assert main_window.is_authenticated()
        logging.debug("Authentication state after setting token checked")

        main_window.current_token = None
        assert not main_window.is_authenticated()
        logging.debug("Authentication state after removing token checked")

        def check_logged_in_state():
            assert main_window.welcome_page.logout_button.isVisible()
            assert not main_window.welcome_page.login_button.isVisible()
            assert not main_window.welcome_page.register_button.isVisible()
            logging.debug("Logged in state UI checked")

        def check_logged_out_state():
            assert not main_window.welcome_page.logout_button.isVisible()
            assert main_window.welcome_page.login_button.isVisible()
            assert main_window.welcome_page.register_button.isVisible()
            logging.debug("Logged out state UI checked")

        QTimer.singleShot(100, lambda: main_window.update_auth_state(True))
        qtbot.wait(200)
        check_logged_in_state()

        QTimer.singleShot(100, lambda: main_window.update_auth_state(False))
        qtbot.wait(200)
        check_logged_out_state()

        logging.debug("test_auth_state_management completed successfully")
    except Exception as e:
        logging.error(f"Test failed: {str(e)}")
        logging.error(traceback.format_exc())
        pytest.fail(f"Test failed due to exception: {str(e)}")
    finally:
        # Ensure proper cleanup
        main_window.close()
        main_window.deleteLater()
        QTest.qWait(100)  # Give some time for cleanup

@pytest.mark.gui
def test_error_messages(app, qtbot, mocker, setup_and_teardown):
    main_window = main(test_mode=True)
    qtbot.addWidget(main_window)

    result, error_message = main_window.login_user("nonexistent", "wrongpassword")
    assert result == False
    assert error_message == "Invalid username or password. Please try again."

    mocker.patch('stojanovic_one.main.register_user', return_value=False)
    result, error_message = main_window.register_user("existinguser", "test@example.com", "password123")
    assert result == False
    assert error_message == "Registration failed. Username or email may already be in use."

    main_window.current_token = "fake_token"
    mocker.patch('stojanovic_one.main.logout_user', return_value=False)
    result, error_message = main_window.logout_user("fake_token")
    assert result == False
    assert error_message == "An error occurred during logout. Please try again."

@pytest.fixture(autouse=True)
def cleanup():
    yield
    for widget in QApplication.topLevelWidgets():
        widget.deleteLater()
    QApplication.processEvents()
    QTest.qWait(100)  # Wait for widget deletion to complete

@pytest.fixture(autouse=True)
def run_around_tests(qapp):
    yield
    QTest.qWait(100)












