import pytest
from PySide6.QtWidgets import QApplication
from PySide6.QtCore import Qt
from PySide6.QtTest import QTest
from stojanovic_one.main import main, MainWindow
import traceback
from stojanovic_one.auth.jwt_utils import generate_token

@pytest.fixture(scope="session")
def app():
    app = QApplication.instance()
    if app is None:
        app = QApplication([])
    yield app
    # Don't call app.quit() here, as it might interfere with other tests

@pytest.fixture
def setup_and_teardown(qtbot):
    yield
    QTest.qWait(100)  # Wait for any pending events to process

@pytest.mark.gui
def test_main(app, qtbot, setup_and_teardown):
    try:
        main_window = main(test_mode=True)
        assert isinstance(main_window, MainWindow)
        assert main_window.isVisible()
        QTest.qWait(500)
        assert main_window.stacked_widget.currentWidget() == main_window.welcome_page
    except Exception as e:
        pytest.fail(f"Test failed due to exception: {str(e)}\n{traceback.format_exc()}")

@pytest.mark.gui
def test_main_window_navigation(app, qtbot, setup_and_teardown):
    main_window = main(test_mode=True)
    qtbot.addWidget(main_window)

    # Test navigation to login form
    qtbot.mouseClick(main_window.welcome_page.login_button, Qt.LeftButton)
    QTest.qWait(500)
    assert main_window.stacked_widget.currentWidget() == main_window.login_form

    # Test navigation to registration form
    main_window.show_welcome_page()
    QTest.qWait(500)
    qtbot.mouseClick(main_window.welcome_page.register_button, Qt.LeftButton)
    QTest.qWait(500)
    assert main_window.stacked_widget.currentWidget() == main_window.registration_form

    # Test navigation back to welcome page after successful registration
    main_window.on_registration_successful()
    QTest.qWait(500)
    assert main_window.stacked_widget.currentWidget() == main_window.welcome_page

@pytest.mark.gui
def test_login_logout_flow(app, qtbot, mocker, setup_and_teardown):
    try:
        main_window = main(test_mode=True)
        qtbot.addWidget(main_window)

        mock_login = mocker.patch('stojanovic_one.main.login_user', return_value="fake_token")

        main_window.show_login_form()
        main_window.login_form.username_input.setText("testuser")
        main_window.login_form.password_input.setText("password123")
        qtbot.mouseClick(main_window.login_form.login_button, Qt.LeftButton)

        QTest.qWait(500)

        mock_login.assert_called_once_with(main_window.conn, "testuser", "password123")

        assert main_window.current_token == "fake_token"
        assert main_window.stacked_widget.currentWidget() == main_window.welcome_page
        assert main_window.welcome_page.logout_button.isVisible()
        assert not main_window.welcome_page.login_button.isVisible()
        assert not main_window.welcome_page.register_button.isVisible()

        mock_logout = mocker.patch('stojanovic_one.main.logout_user', return_value=True)
        main_window.perform_logout()

        QTest.qWait(500)

        mock_logout.assert_called_once_with("fake_token")

        assert main_window.current_token is None
        assert main_window.stacked_widget.currentWidget() == main_window.welcome_page
        assert not main_window.welcome_page.logout_button.isVisible()
        assert main_window.welcome_page.login_button.isVisible()
        assert main_window.welcome_page.register_button.isVisible()

    except Exception as e:
        pytest.fail(f"Test failed due to exception: {str(e)}\n{traceback.format_exc()}")

@pytest.mark.gui
def test_registration_flow(app, qtbot, mocker, setup_and_teardown):
    try:
        main_window = main(test_mode=True)
        qtbot.addWidget(main_window)

        mock_register = mocker.patch('stojanovic_one.main.register_user', return_value=True)

        main_window.show_registration_form()
        main_window.registration_form.username_input.setText("newuser")
        main_window.registration_form.email_input.setText("newuser@example.com")
        main_window.registration_form.password_input.setText("password123")
        qtbot.mouseClick(main_window.registration_form.register_button, Qt.LeftButton)

        QTest.qWait(500)

        mock_register.assert_called_once()
        args = mock_register.call_args[0]
        assert args[0] == main_window.conn
        assert args[1] == "newuser"
        assert args[2] == "newuser@example.com"
        assert args[3].startswith(b'$2b$')  # Check if the password is hashed

        assert main_window.stacked_widget.currentWidget() == main_window.welcome_page

    except Exception as e:
        pytest.fail(f"Test failed due to exception: {str(e)}\n{traceback.format_exc()}")

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
    main_window = main(test_mode=True)
    qtbot.addWidget(main_window)

    assert not main_window.is_authenticated()   

    main_window.current_token = "fake_token"
    assert main_window.is_authenticated()

    main_window.current_token = None
    assert not main_window.is_authenticated()

    main_window.update_auth_state(True)
    QTest.qWait(500)
    assert main_window.welcome_page.logout_button.isVisible()
    assert not main_window.welcome_page.login_button.isVisible()
    assert not main_window.welcome_page.register_button.isVisible()

    main_window.update_auth_state(False)
    QTest.qWait(500)
    assert not main_window.welcome_page.logout_button.isVisible()
    assert main_window.welcome_page.login_button.isVisible()
    assert main_window.welcome_page.register_button.isVisible()

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