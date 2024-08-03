# tests/test_main.py

import pytest
from PySide6.QtWidgets import QApplication
from PySide6.QtCore import Qt
from stojanovic_one.main import main, MainWindow
import sys
import traceback
from stojanovic_one.auth.jwt_utils import generate_token

@pytest.fixture
def app(qtbot):
    application = QApplication.instance()
    if application is None:
        application = QApplication([])
    yield application
    application.quit()

@pytest.mark.gui
def test_main(app, qtbot):
    try:
        main_window = main(test_mode=True)
        assert isinstance(main_window, MainWindow)
        assert main_window.isVisible()
        assert main_window.stacked_widget.currentWidget() == main_window.welcome_page
    except Exception as e:
        print(f"Error in test_main: {str(e)}")
        print("Traceback:")
        traceback.print_exc()
        pytest.fail(f"Test failed due to exception: {str(e)}")

@pytest.mark.gui
def test_main_window_navigation(app, qtbot):
    try:
        main_window = main(test_mode=True)
        qtbot.addWidget(main_window)

        # Test navigation to login form
        main_window.welcome_page.login_clicked.emit()
        assert main_window.stacked_widget.currentWidget() == main_window.login_form

        # Test navigation to registration form
        main_window.welcome_page.register_clicked.emit()
        assert main_window.stacked_widget.currentWidget() == main_window.registration_form

        # Test navigation back to welcome page after successful registration
        main_window.registration_form.registration_successful.emit()
        assert main_window.stacked_widget.currentWidget() == main_window.welcome_page

    except Exception as e:
        print(f"Error in test_main_window_navigation: {str(e)}")
        print("Traceback:")
        traceback.print_exc()
        pytest.fail(f"Test failed due to exception: {str(e)}")

@pytest.mark.gui
def test_login_logout_flow(app, qtbot, mocker):
    try:
        main_window = main(test_mode=True)
        qtbot.addWidget(main_window)

        # Mock the login_user function to return a fake token
        mock_login = mocker.patch('stojanovic_one.main.login_user', return_value="fake_token")

        # Test login
        main_window.show_login_form()
        main_window.login_form.username_input.setText("testuser")
        main_window.login_form.password_input.setText("password123")
        qtbot.mouseClick(main_window.login_form.login_button, Qt.LeftButton)

        # Wait for the login process to complete
        qtbot.wait(100)

        # Check if the mocked function was called
        mock_login.assert_called_once_with(main_window.conn, "testuser", "password123")

        assert main_window.current_token == "fake_token"
        assert main_window.stacked_widget.currentWidget() == main_window.welcome_page
        assert main_window.welcome_page.logout_button.isVisible()
        assert not main_window.welcome_page.login_button.isVisible()
        assert not main_window.welcome_page.register_button.isVisible()

        # Test logout
        mock_logout = mocker.patch('stojanovic_one.main.logout_user', return_value=True)
        main_window.perform_logout()  # Call perform_logout directly

        # Wait for the logout process to complete
        qtbot.wait(100)

        # Check if the mocked function was called
        mock_logout.assert_called_once_with("fake_token")

        assert main_window.current_token is None
        assert main_window.stacked_widget.currentWidget() == main_window.welcome_page
        assert not main_window.welcome_page.logout_button.isVisible()
        assert main_window.welcome_page.login_button.isVisible()
        assert main_window.welcome_page.register_button.isVisible()

    except Exception as e:
        print(f"Error in test_login_logout_flow: {str(e)}")
        print("Traceback:")
        traceback.print_exc()
        pytest.fail(f"Test failed due to exception: {str(e)}")

@pytest.mark.gui
def test_registration_flow(app, qtbot, mocker):
    try:
        main_window = main(test_mode=True)
        qtbot.addWidget(main_window)

        # Mock the register_user function to return True
        mock_register = mocker.patch('stojanovic_one.main.register_user', return_value=True)

        # Test registration
        main_window.show_registration_form()
        main_window.registration_form.username_input.setText("newuser")
        main_window.registration_form.email_input.setText("newuser@example.com")
        main_window.registration_form.password_input.setText("password123")
        qtbot.mouseClick(main_window.registration_form.register_button, Qt.LeftButton)

        # Wait for the registration process to complete
        qtbot.wait(100)

        # Check if the mocked function was called
        mock_register.assert_called_once_with(main_window.conn, "newuser", "newuser@example.com", "password123")

        assert main_window.stacked_widget.currentWidget() == main_window.welcome_page

    except Exception as e:
        print(f"Error in test_registration_flow: {str(e)}")
        print("Traceback:")
        traceback.print_exc()
        pytest.fail(f"Test failed due to exception: {str(e)}")

@pytest.mark.gui
def test_protected_routes(app, qtbot, mocker):
    try:
        main_window = main(test_mode=True)
        qtbot.addWidget(main_window)

        # Test accessing protected route without token
        main_window.show_logout_form()
        assert main_window.stacked_widget.currentWidget() == main_window.welcome_page

        # Mock login to set a valid token
        main_window.current_token = generate_token("testuser")

        # Test accessing protected route with valid token
        main_window.show_logout_form()
        assert main_window.stacked_widget.currentWidget() == main_window.logout_form

        # Test authentication failure
        mock_validate = mocker.patch('stojanovic_one.auth.jwt_utils.validate_token', return_value=None)
        
        # Simulate authentication failure by calling handle_auth_failure directly
        main_window.handle_auth_failure()

        # Wait for the UI to update
        qtbot.wait(100)

        assert main_window.stacked_widget.currentWidget() == main_window.welcome_page
        assert main_window.current_token is None

    except Exception as e:
        print(f"Error in test_protected_routes: {str(e)}")
        print("Traceback:")
        traceback.print_exc()
        pytest.fail(f"Test failed due to exception: {str(e)}")

@pytest.mark.gui
def test_auth_state_management(app, qtbot):
    main_window = main(test_mode=True)
    qtbot.addWidget(main_window)

    # Initially, user should not be authenticated
    assert not main_window.is_authenticated()   

    # Simulate login
    main_window.current_token = "fake_token"
    assert main_window.is_authenticated()

    # Simulate logout
    main_window.current_token = None
    assert not main_window.is_authenticated()

    # Test UI updates
    main_window.update_auth_state(True)
    assert main_window.welcome_page.logout_button.isVisible()
    assert not main_window.welcome_page.login_button.isVisible()
    assert not main_window.welcome_page.register_button.isVisible()

    main_window.update_auth_state(False)
    assert not main_window.welcome_page.logout_button.isVisible()
    assert main_window.welcome_page.login_button.isVisible()
    assert main_window.welcome_page.register_button.isVisible()

@pytest.mark.gui
def test_error_messages(app, qtbot, mocker):
    main_window = main(test_mode=True)
    qtbot.addWidget(main_window)

    # Mock QMessageBox.warning to avoid showing actual message boxes during tests
    mock_warning = mocker.patch('PySide6.QtWidgets.QMessageBox.warning')

    # Test login failure
    main_window.login_user("nonexistent", "wrongpassword")
    mock_warning.assert_called_with(main_window, "Login Failed", "Invalid username or password. Please try again.")

    # Test registration failure
    mocker.patch('stojanovic_one.main.register_user', return_value=False)
    main_window.register_user("existinguser", "test@example.com", "password123")
    mock_warning.assert_called_with(main_window, "Registration Failed", "Registration failed. Username or email may already be in use.")

    # Test logout failure
    main_window.current_token = "fake_token"
    mocker.patch('stojanovic_one.main.logout_user', return_value=False)
    main_window.logout_user("fake_token")
    mock_warning.assert_called_with(main_window, "Logout Failed", "An error occurred during logout. Please try again.")