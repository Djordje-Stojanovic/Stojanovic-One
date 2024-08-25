# Stojanovic-One

## Project Description

Stojanovic-One is a web application built using a modern tech stack, focusing on best practices in software development, including Test-Driven Development (TDD) and continuous integration. This project aims to provide a robust and efficient platform for user management and authentication.

Key features include:

- User registration and authentication
- User profile management
- Secure API endpoints with JWT authentication
- Responsive frontend design

## Tech Stack

- Backend: Python 3.11+, FastAPI, SQLAlchemy, PostgreSQL
- Frontend: React, TypeScript, Tailwind CSS
- Testing: pytest, Jest, React Testing Library
- Additional: Alembic (for database migrations), JWT (for authentication), Axios (for API requests)

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 14+
- PostgreSQL

### Installation

1. Clone the repository

   ```
   git clone https://github.com/your-username/Stojanovic-One.git
   cd Stojanovic-One
   ```

2. Set up the backend:

   ```
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   pip install -r requirements.txt
   ```

3. Set up the database:

   - Create a PostgreSQL database
   - Create a `.env` file in the `backend` directory with the following content:
     ```
     DATABASE_URL=postgresql://username:password@localhost/database_name
     SECRET_KEY=your_secret_key_here
     ```

4. Run database migrations:

   ```
   alembic upgrade head
   ```

5. Set up the frontend:
   ```
   cd ../frontend
   npm install
   ```

## Authentication

This project uses Auth0 for authentication. To set up Auth0:

1. Create an Auth0 account and set up a new application.
2. Configure the following environment variables in your `.env` file:

   ```
   REACT_APP_AUTH0_DOMAIN=your-auth0-domain
   REACT_APP_AUTH0_CLIENT_ID=your-auth0-client-id
   REACT_APP_AUTH0_AUDIENCE=your-api-identifier
   ```

3. Update the allowed callback URLs in your Auth0 application settings to include `http://localhost:3000`.

## Usage

1. Start the backend server:

   ```
   cd backend
   uvicorn app.main:app --reload
   ```

2. Start the frontend development server:

   ```
   cd frontend
   npm start
   ```

3. Access the application at `http://localhost:3000`

4. API documentation is available at `http://localhost:8000/docs`

## Features

- User Registration: New users can create an account with email and password.
- User Authentication: Secure login system using JWT tokens.
- User Profile: Users can view and edit their profile information.
- Responsive Design: The frontend is built with a mobile-first approach using Tailwind CSS.
- API Documentation: Comprehensive API documentation using Swagger UI.

## Running Tests

- Backend tests:

  ```
  cd backend
  pytest
  ```

- Frontend tests:
  ```
  cd frontend
  npm test
  ```

## Contributing

We welcome contributions to Stojanovic-One! Please read our [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## Continuous Integration

This project uses GitHub Actions for continuous integration. The workflow includes:

- Running backend tests with pytest
- Running frontend tests with Jest
- Linting Python code with flake8
- Type checking Python code with mypy
- Linting TypeScript code with ESLint

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Acknowledgments

- FastAPI for the excellent Python web framework
- React team for the powerful frontend library
- All contributors who have helped shape this project
