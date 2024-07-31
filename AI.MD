# AI.MD - Project Collaboration Guide

## Project Overview

Stojanovic-One is a Python-based application utilizing SQLite for data storage and PySide6 for the graphical user interface. The project aims to implement best practices in software development, including Test-Driven Development (TDD) and continuous integration.

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
│       └── ui/
│           ├── __init__.py
│           └── registration_form.py
├── tests/
│   ├── __init__.py
│   ├── test_main.py
│   ├── database/
│   │   ├── test_database_setup.py
│   │   └── test_user_management.py
│   └── ui/
│       └── test_registration_form.py
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
└── AI.MD
```

## Technology Stack

- Python 3.11+
- SQLite for database
- PySide6 for GUI
- pytest for testing
- pytest-qt for GUI testing
- pytest-mock for mocking in tests
- bcrypt for password hashing
- GitHub Actions for CI/CD

## Technology Stack

- Python 3.11+
- SQLite for database
- PySide6 for GUI
- pytest for testing
- pytest-qt for GUI testing
- pytest-mock for mocking in tests
- bcrypt for password hashing
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

   Remember to update the GitHub Actions workflow (`python-tests.yml`) if you make any changes to the testing process or environment requirements.

7. **Documentation**: Update relevant documentation (including this AI.MD if necessary) as the project evolves.

## Best Practices

1. **Test-Driven Development (TDD)**: Always write tests before implementing features. Aim for high test coverage.

2. **Code Quality**: Use tools like Black for formatting, flake8 for linting, and mypy for type checking. Consider setting up pre-commit hooks for these.

3. **Version Control**: Make small, frequent commits with clear, descriptive messages. Use feature branches for development.

4. **Database Management**: Use SQLAlchemy for database operations to ensure clean, maintainable database interactions.

5. **UI Development**: Separate UI logic from business logic. Use Qt Designer for layout creation when possible.

6. **Error Handling**: Implement comprehensive error handling and logging throughout the application.

7. **Security**: Follow security best practices, especially for user authentication and data storage. Use bcrypt for password hashing.

8. **Performance**: Regularly profile the application and optimize performance bottlenecks.

9. **Dependency Management**: Regularly update dependencies and check for security vulnerabilities.

10. **Documentation**: Maintain up-to-date documentation, including docstrings for all functions and classes.

11. **GUI Testing**: Use pytest-qt for testing GUI components to ensure proper functionality and user interaction.

12. **Mocking**: Utilize pytest-mock for creating mock objects in tests, especially for database connections and external services.

13. **File Paths**: Always include the full file path as a comment at the top of each file. This helps with navigation and understanding the project structure.

14. **pytest Configuration**: Use `pytest.ini` for configuring pytest behavior, including custom markers like `@pytest.mark.gui` for GUI tests.

## AI Assistance

As your AI assistant, I can help with:

- Breaking down features into manageable tasks
- Providing code snippets and examples
- Offering advice on best practices and design patterns
- Reviewing code and suggesting improvements
- Helping troubleshoot issues
- Updating project documentation
- Suggesting test cases and testing strategies

Remember to provide clear context when asking for assistance, and don't hesitate to ask for clarification or additional information.

## Continuous Improvement

This document and our workflow are not set in stone. As we work together and the project evolves, we may find areas for improvement in our process. Feel free to suggest changes or ask for adjustments to this workflow at any time.
