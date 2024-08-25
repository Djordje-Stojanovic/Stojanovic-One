# AI.MD - Project Collaboration Guide

Please this is utterly important provide full file paths for each file you edit, create or delete.
Always provide it in a format like this: edit this file now: /Stojanovic-One/frontend/src/pages/Home.tsx or create this file in this path: /Stojanovic-One/frontend/src/pages/Home.tsx

## Project Overview

This project is a web application built using a modern tech stack, focusing on best practices in software development, including Test-Driven Development (TDD) and continuous integration.

## Technology Stack

- Frontend: React, TypeScript, Tailwind CSS
- Backend: FastAPI, Python 3.11+
- Database: PostgreSQL
- ORM: SQLAlchemy
- Additional: Alembic, JWT, Axios

## Project Structure and File Paths

Always include the full file path as a comment at the top of each file you create or modify. Update this section with new file paths as the project evolves.

```
E:\Stojanovic-One\
├── .cursorignore
├── .cursorrules
├── .flake8
├── .gitignore
├── AI.MD
├── README.md
├── .github\
│   └── workflows\
│       └── ci.yml
├── backend\
│   ├── .env
│   ├── .pytest_cache\
│   ├── alembic\
│   │   ├── versions\
│   │   ├── env.py
│   │   ├── README
│   │   └── script.py.mako
│   ├── alembic.ini
│   ├── app\
│   │   ├── api\
│   │   │   ├── endpoints\
│   │   │   │   └── users.py
│   │   │   └── auth_routes.py
│   │   ├── core\
│   │   │   ├── auth.py
│   │   │   ├── auth0.py
│   │   │   ├── config.py
│   │   │   ├── database.py
│   │   │   ├── error_handler.py
│   │   │   └── logger.py
│   │   ├── crud\
│   │   │   └── user_crud.py
│   │   ├── models\
│   │   │   ├── base.py
│   │   │   ├── user.py
│   │   │   └── __init__.py
│   │   ├── schemas\
│   │   │   └── user.py
│   │   ├── main.py
│   │   └── __init__.py
│   ├── app.log
│   ├── mypy.ini
│   ├── pytest.ini
│   ├── requirements.txt
│   ├── test.db
│   └── tests\
│       ├── conftest.py
│       ├── test_main.py
│       └── test_users.py
└── frontend\
    ├── .env
    ├── .eslintrc.js
    ├── .gitignore
    ├── babel.config.js
    ├── coverage\
    │   ├── lcov-report\
    │   └── lcov.info
    ├── jest.config.js
    ├── package-lock.json
    ├── package.json
    ├── postcss.config.js
    ├── public\
    │   ├── favicon.ico
    │   ├── index.html
    │   ├── logo192.png
    │   ├── logo512.png
    │   ├── manifest.json
    │   └── robots.txt
    ├── README.md
    ├── src\
    │   ├── components\
    │   │   ├── tests\
    │   │   │   ├── Login.test.tsx
    │   │   │   └── UserProfile.test.tsx
    │   │   ├── EditUserProfile.tsx
    │   │   ├── ErrorBoundary.tsx
    │   │   ├── Footer.tsx
    │   │   ├── Header.tsx
    │   │   ├── Login.tsx
    │   │   ├── Navbar.tsx
    │   │   ├── Register.tsx
    │   │   └── UserProfile.tsx
    │   ├── context\
    │   │   └── AuthContext.tsx
    │   ├── pages\
    │   │   ├── tests\
    │   │   │   └── Home.test.tsx
    │   │   └── Home.tsx
    │   ├── types\
    │   │   └── user.ts
    │   ├── utils\
    │   │   ├── tests\
    │   │   │   └── api.test.ts
    │   │   ├── api.ts
    │   │   └── auth.ts
    │   ├── App.css
    │   ├── App.test.tsx
    │   ├── App.tsx
    │   ├── index.css
    │   ├── index.tsx
    │   ├── logo.svg
    │   ├── react-app-env.d.ts
    │   ├── reportWebVitals.ts
    │   └── setupTests.ts
    ├── tailwind.config.js
    └── tsconfig.json
```

## Elon Musk's Algorithm for Efficiency

Apply these principles throughout the development process:

1. Question every requirement: Critically evaluate each feature and its necessity.
2. Delete unnecessary parts: Streamline the project by removing non-essential elements.
3. Simplify and optimize: Refine remaining components for maximum efficiency.
4. Accelerate cycle time: Improve development speed without compromising quality.
5. Automate: Implement automation as the final step after optimizing manual processes.

## Development Philosophy

1. Produce clear, readable, and efficient Python and JavaScript/TypeScript code.
2. Use the latest stable versions of all technologies in the stack.
3. Provide accurate, factual, and thoughtful solutions.
4. Follow user requirements meticulously, applying Elon Musk's principles.
5. Think step-by-step: describe plans in detailed pseudocode before implementation.
6. Write correct, up-to-date, bug-free, fully functional, secure, and efficient code.
7. Prioritize readability over performance, unless explicitly required otherwise.
8. Fully implement all requested functionality without TODOs or placeholders.
9. Be concise in explanations while ensuring clarity.
10. Admit when there's uncertainty rather than guessing.
11. Always include file paths at the top of each code file and update the Project Structure section.
12. Always run database migrations after updating models:
    a. `alembic revision --autogenerate -m "Description of changes"`
    b. `alembic upgrade head`

## Database Migrations

We use Alembic for database migrations. Key points:

- Migration files are stored in `backend/alembic/versions/`
- To create a new migration: `alembic revision --autogenerate -m "Description of changes"`
- To apply migrations: `alembic upgrade head`
- Always review autogenerated migrations before applying them
- Include migration files in version control

## Development Workflow

Apply Elon Musk's efficiency principles throughout this workflow:

1. **Project Setup**

   - Set up project structure (backend, frontend, etc.)
   - Initialize Git repository
   - Create virtual environments
   - Set up basic files (README.md, .gitignore, requirements.txt)

2. **Planning and Issue Management**

   - Create GitHub Issues for features, bugs, and improvements
   - Organize issues into milestones
   - Question every requirement critically
   - Break down large issues into smaller, manageable tasks

3. **Development Cycle**

   - Choose an issue to work on
   - Create a feature branch: `git checkout -b feature/issue-description`
   - Apply Test-Driven Development (TDD):
     a. Write failing tests
     b. Implement minimum code to pass tests
     c. Refactor while maintaining passing tests
   - If database schema changes are required:
     a. Update SQLAlchemy models
     b. Generate migration: `alembic revision --autogenerate -m "Description of changes"`
     c. Review and adjust the generated migration file if necessary
     d. Apply migration: `alembic upgrade head`
   - Push changes regularly: `git push origin feature/issue-description`

4. **Code Review and Merging**

   - Look for potential improvements or missed cases
   - Ensure all tests pass and update documentation
   - Merge into main when ready
   - Delete the feature branch

5. **Testing**

   - Write unit tests for all new functionality
   - Aim for high test coverage (e.g., 80% or higher)
   - Run the full test suite before pushing changes
   - For backend: `pytest -v --import-mode=importlib`
   - For frontend: `npm test` or `npm run test:watch` for watch mode

6. **Continuous Integration**

   - Use GitHub Actions for automated testing
   - Set up workflows to run tests on every push and pull request
   - Include linting and type checking in the CI process

7. **Documentation**

   - Keep README.md up-to-date
   - Use docstrings for all functions, classes, and modules
   - Update this AI.MD with any process changes

8. **Code Quality**

   - Use Black for Python code formatting
   - Use ESLint and Prettier for JavaScript/TypeScript
   - Implement static type checking (mypy for Python, TypeScript for frontend)
   - Set up pre-commit hooks for automated checks

9. **Dependency Management**

   - Regularly update dependencies
   - Use tools like pip-compile or npm audit to manage dependencies
   - Check for security vulnerabilities regularly

10. **Version Control**
    - Include Alembic migration files in version control
    - This ensures consistent database schema across all environments and developers
    - Review migration files before committing to ensure they accurately represent intended changes

## Code Style and Linting

- Use Black for Python code formatting
- Use ESLint and Prettier for JavaScript/TypeScript
- Set up pre-commit hooks for automated checks

## Security

- Implement CORS (Cross-Origin Resource Sharing) correctly
- Use environment variables for sensitive information
- Implement rate limiting for API endpoints

## Performance

- Use caching where appropriate (e.g., Redis for backend, React.memo for frontend)
- Implement pagination for large datasets
- Use lazy loading for React components when possible

## Continuous Improvement

This document and our workflow are adaptable. As the project evolves, we may adjust our processes and practices. Always look for ways to simplify, optimize, and accelerate our development cycle without compromising quality.

- Regularly review and question each step of our workflow
- Be open to removing or changing practices that no longer serve the project efficiently
- Encourage innovative approaches to problem-solving and process improvement

Remember:

- When implementing features or fixing bugs, always start by writing failing tests, then implement the minimum code to pass those tests, and finally refactor while keeping the tests passing.
- Always include the full file path as a comment at the top of each file you create or modify.
- Continuously apply Elon Musk's efficiency principles throughout the development process.

## Windows-Specific Instructions

When working on Windows, use PowerShell for command-line operations. Here are some Windows-specific commands:

- To remove a directory: `Remove-Item -Recurse -Force directory_name`
- To create a directory: `New-Item -ItemType Directory -Force -Path directory_name`
- To set environment variables: `$env:VARIABLE_NAME = "value"`

## Auth0:

- dev-mq6z36ctrsx6y3c0.eu.auth0.com
