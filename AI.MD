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

1. **Feature Request**: Developer provides a high-level description of a needed feature or enhancement.

2. **Milestone Creation**: AI assistant creates a milestone based on the feature request, outlining goals and expected outcomes.

3. **Issue Breakdown**: AI assistant breaks down the milestone into manageable, TDD-aligned tasks.

4. **Issue Implementation**: For each issue:
   a. Write failing tests
   b. Implement minimum code to pass tests
   c. Refactor while maintaining passing tests

5. **Code Review**: Self-review changes and consider AI assistance for complex parts.

6. **Continuous Integration**:

   - GitHub Actions runs on Ubuntu with Python 3.11.3
   - Installs dependencies from `requirements.txt`
   - Runs non-GUI tests: `pytest -v -m "not gui" tests`
   - Fails if any tests fail, preventing merges

   Local Testing:

   - All tests: `pytest`
   - Non-GUI tests: `pytest -m "not gui"`

7. **Documentation**: Update relevant documentation as the project evolves.

## Best Practices

1. **Apply Elon Musk's Algorithm for Efficiency**:
   a. Question every requirement: Identify who made each requirement and challenge it, regardless of the source, check carefully to see if it is a smart or dumb requirement.
   b. Delete any unnecessary part or process: Be prepared to add back about 10% of deleted items later. Better to have smart than dumb requirements.
   c. Simplify and optimize: Only after unnecessary dumb elements are removed optimize and simplyfiy your problem.
   d. Accelerate cycle time: Speed up necessary processes.
   e. Automate: As the final step, after all other optimizations.

2. **Test-Driven Development (TDD)**: Write tests before implementing features. Aim for high test coverage.

3. **Database Management**: Use SQLite for efficient data storage and retrieval.

4. **UI Development**: Separate UI logic from business logic. Implement responsive design for various screen sizes.

5. **Error Handling and Security**:

   - Implement comprehensive error handling throughout the application.
   - Use JWT tokens for authentication and protect sensitive routes with the `@protect_route` decorator.
   - Regularly review and update security measures.

6. **Code Quality and Maintenance**:

   - Use meaningful variable and function names.
   - Keep functions small and focused on a single responsibility.
   - Regularly refactor code to improve structure and eliminate duplication.

7. **Testing and Mocking**:

   - Use pytest-qt for GUI component testing.
   - Utilize pytest-mock for creating mock objects in tests.

8. **Documentation and File Organization**:

   - Maintain up-to-date documentation, including docstrings for all functions and classes.
   - Include full file paths as comments at the top of each file.

9. **Continuous Improvement**:
   - Regularly update dependencies and check for security vulnerabilities.
   - Profile the application and optimize performance bottlenecks.
   - Be open to process improvements and workflow adjustments.

## Continuous Improvement

This document and our workflow are not set in stone. As we work together and the project evolves, we may find areas for improvement in our process. Feel free to suggest changes or ask for adjustments to this workflow at any time.
