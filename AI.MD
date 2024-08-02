# AI.MD - Project Collaboration Guide

## Project Overview

Stojanovic-One is a Python-based application utilizing SQLite for data storage and PySide6 for the graphical user interface. The project aims to implement best practices in software development, including Test-Driven Development (TDD) and continuous integration. The application now includes JWT-based authentication middleware for protected routes.

## Important Development Practices

1. Always update the `main.py` file when adding new functionality or making significant changes to the application. This file serves as the entry point for the application and should reflect all major features and components.

2. Maintain comprehensive documentation throughout the project:

   - Provide detailed docstrings for all functions, classes, and modules.
   - Include inline comments for complex logic or non-obvious code sections.
   - Keep README.md and other documentation files up-to-date.
   - Remember to update the GitHub Actions workflow (`python-tests.yml`) if you make any changes to the testing process or environment requirements.

3. Include the full file path as a comment at the top of each Python script. This helps with navigation and understanding the project structure. For example:

   ```python
   # src/stojanovic_one/ui/login_form.py
   ```

4. Regularly update the requirements.txt file when adding new dependencies or updating existing ones. This ensures that all team members and deployment environments have the correct package versions.

5. When writing tests, always consider whether they are GUI tests or non-GUI tests:

   - Use the @pytest.mark.gui decorator for GUI tests.
   - This distinction allows for proper testing both locally and in GitHub Actions, where GUI tests may be excluded.

6. Maintain a clear separation between GUI and non-GUI components to facilitate testing and future maintenance.

7. Always think about error handling and edge cases when implementing new features or modifying existing ones.

8. Keep the project structure updated in this AI.MD file whenever new files or directories are added.

9. Follow Test-Driven Development (TDD) principles rigorously:

   - Write tests before implementing features.
   - Run tests frequently during development.
   - Refactor code after passing tests to improve design and maintainability.
   - Aim for high test coverage, especially for critical functionality.

10. Implement responsive design for GUI components:

    - Ensure that UI elements adapt to different screen sizes.
    - Test the application on various display resolutions.

11. Prioritize code readability and maintainability:

    - Use meaningful variable and function names.
    - Keep functions small and focused on a single responsibility.
    - Regularly refactor code to improve its structure and eliminate duplication.

12. Implement and maintain authentication middleware:
    - Use JWT tokens for user authentication.
    - Protect sensitive routes and operations using the `@protect_route` decorator.
    - Regularly review and update authentication mechanisms for security.

## Project Structure

```
Stojanovic-One/
├── src/
│   └── stojanovic_one/
│       ├── __init__.py
│       ├── main.py
│       ├── database/
│       │   ├── __init__.py
│       │   ├── setup.py
│       │   └── user_management.py
│       ├── ui/
│       │   ├── __init__.py
│       │   ├── welcome_page.py
│       │   ├── login_form.py
│       │   ├── registration_form.py
│       │   └── logout_form.py
│       └── auth/
│           ├── __init__.py
│           ├── jwt_utils.py
│           └── middleware.py
├── tests/
│   ├── __init__.py
│   ├── test_main.py
│   ├── database/
│   │   ├── test_database_setup.py
│   │   └── test_user_management.py
│   ├── ui/
│   │   ├── test_welcome_page.py
│   │   ├── test_login_form.py
│   │   ├── test_registration_form.py
│   │   └── test_logout_form.py
│   └── auth/
│       ├── test_jwt_utils.py
│       └── test_middleware.py
├── .github/
│   └── workflows/
│       └── python-tests.yml
├── docs/
├── setup.py
├── requirements.txt
├── README.md
├── CHANGELOG.md
├── .gitignore
├── pytest.ini
├── AI.MD
└── WORKFLOW.md
```

## Technology Stack

- Python 3.11+
- SQLite for database
- PySide6 for GUI
- pytest for testing
- pytest-qt for GUI testing
- pytest-mock for mocking in tests
- bcrypt for password hashing
- PyJWT for JWT token handling
- GitHub Actions for CI/CD

## Collaboration Workflow

1. **Feature Request**: You (the developer) will provide a high-level description of a feature or enhancement needed for the project.

2. **Milestone Creation**: I (the AI assistant) will create a milestone based on your feature request, outlining the overall goal and expected outcomes.

3. **Issue Breakdown**: You'll ask me to break down the milestone into manageable issues. I'll create a list of smaller, focused tasks that align with Test-Driven Development principles and best practices.

4. **Issue Implementation**: For each issue, follow this TDD approach:
   a. Write failing tests
   b. Implement the minimum code to make tests pass
   c. Refactor while keeping tests green

5. **Code Review**: After implementing an issue, review the changes yourself and consider asking for AI assistance in reviewing complex parts.

6. **Continuous Integration**

   Our project uses GitHub Actions for continuous integration. The workflow is set up to run all tests, excluding GUI tests, on every push and pull request. Here's how it works:

   1. **Environment Setup**: The workflow runs on an Ubuntu environment and sets up Python 3.11.3.
   2. **System Dependencies**: We install necessary system dependencies, including libraries required for PySide6.
   3. **Python Dependencies**: All project dependencies listed in `requirements.txt` are installed.
   4. **Running Tests**: All non-GUI tests are executed using pytest with the command `pytest -v -m "not gui" tests`.
   5. **Test Results**: The workflow will fail if any tests fail, preventing merging of branches with failing tests.

   ### Local vs CI Testing

   While the CI environment runs only non-GUI tests, you should run all tests locally, including GUI tests, for comprehensive testing:

   - To run all tests locally: `pytest`
   - To run only non-GUI tests: `pytest -m "not gui"`

7. **Documentation**: Update relevant documentation (including this AI.MD if necessary) as the project evolves.

## Best Practices

1. **Test-Driven Development (TDD)**: Always write tests before implementing features. Aim for high test coverage.

2. **Database Management**: Use SQLAlchemy for database operations to ensure clean, maintainable database interactions.

3. **UI Development**: Separate UI logic from business logic. Use Qt Designer for layout creation when possible.

4. **Error Handling**: Implement comprehensive error handling and logging throughout the application.

5. **Performance**: Regularly profile the application and optimize performance bottlenecks.

6. **Dependency Management**: Regularly update dependencies and check for security vulnerabilities.

7. **Documentation**: Maintain up-to-date documentation, including docstrings for all functions and classes.

8. **GUI Testing**: Use pytest-qt for testing GUI components to ensure proper functionality and user interaction.

9. **Mocking**: Utilize pytest-mock for creating mock objects in tests, especially for database connections and external services.

10. **File Paths**: Always include the full file path as a comment at the top of each file. This helps with navigation and understanding the project structure.

11. **pytest Configuration**: Use `pytest.ini` for configuring pytest behavior, including custom markers like `@pytest.mark.gui` for GUI tests.

12. **Responsive Design**: Implement responsive design principles in GUI components to ensure proper display on various screen sizes.

13. **Authentication**: Use JWT tokens for user authentication and protect sensitive routes with the `@protect_route` decorator.

14. **Security**: Regularly review and update security measures, including password hashing, token management, and protected routes.

## Continuous Improvement

This document and our workflow are not set in stone. As we work together and the project evolves, we may find areas for improvement in our process. Feel free to suggest changes or ask for adjustments to this workflow at any time.
