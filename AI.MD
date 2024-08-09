# AI.MD - Project Collaboration Guide

## Project Overview

This project is a web application built using a modern tech stack, focusing on best practices in software development, including Test-Driven Development (TDD) and continuous integration.

## Technology Stack

- Frontend: React, Tailwind CSS
- Backend: FastAPI, Python 3.11+
- Database: PostgreSQL
- ORM: SQLAlchemy
- Additional: Alembic, JWT, Axios

## Project Structure and File Paths

Always include the full file path as a comment at the top of each file you create or modify. Update this section with new file paths as the project evolves.

```
E:\Stojanovic-One/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── api/
│   │   └── core/
│   ├── tests/
│   ├── alembic/
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── styles/
│   │   └── utils/
│   ├── public/
│   └── package.json
├── .github/
│   └── workflows/
├── .cursorignore
├── .cursorrules
├── AI.MD
└── README.md
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

[The rest of the document remains the same as in the previous version]

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
   - For frontend: Use Jest and React Testing Library

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

## Continuous Improvement

This document and our workflow are adaptable. As the project evolves, we may adjust our processes and practices. Always look for ways to simplify, optimize, and accelerate our development cycle without compromising quality.

- Regularly review and question each step of our workflow
- Be open to removing or changing practices that no longer serve the project efficiently
- Encourage innovative approaches to problem-solving and process improvement

Remember:

- When implementing features or fixing bugs, always start by writing failing tests, then implement the minimum code to pass those tests, and finally refactor while keeping the tests passing.
- Always include the full file path as a comment at the top of each file you create or modify.
- Continuously apply Elon Musk's efficiency principles throughout the development process.
