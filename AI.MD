# AI.MD - Project Collaboration Guide

## Project Overview

This project is a SvelteKit Full-Stack Solution, focusing on best practices in software development, including Test-Driven Development (TDD) and continuous integration. It features a dark mode implementation and uses Supabase for authentication and database management.

## Full File Paths:

Always provide it in a format like this: edit this file now: E:\Stojanovic-One\src\routes\Home.svelte or create this file in this path: E:\Stojanovic-One\src\routes\Home.svelte

## Technology Stack

- Frontend & Backend: SvelteKit
- Database: PostgreSQL (via Supabase)
- UI Styling: Tailwind CSS
- Deployment: Vercel
- Authentication: Supabase Auth

## Project Structure

E:\Stojanovic-One\
├── .gitignore
├── .npmrc
├── .prettierignore
├── .prettierrc
├── AI.MD
├── README.md
├── eslint.config.js
├── package.json
├── postcss.config.js
├── src\
│ ├── app.css
│ ├── app.d.ts
│ ├── app.html
│ ├── lib\
│ │ ├── components\
│ │ │ └── ThemeToggle.svelte
│ │ ├── supabaseClient.ts
│ │ └── stores\
│ │ └── sessionStore.ts
│ └── routes\
│ ├── +layout.svelte
│ ├── +layout.ts
│ ├── +page.svelte
│ ├── login\
│ │ └── +page.svelte
│ ├── profile\
│ │ └── +page.svelte
│ └── register\
│ └── +page.svelte
├── static\
│ └── favicon.png
├── svelte.config.js
├── tailwind.config.ts
├── tsconfig.json
├── vite.config.ts
└── .env

This structure will be updated as the project evolves.

## Elon Musk's Algorithm for Efficiency

Apply these principles throughout the development process:

1. Question every requirement
2. Delete unnecessary parts
3. Simplify and optimize
4. Accelerate cycle time
5. Automate

## Development Philosophy

1. Produce clear, readable, and efficient Svelte and TypeScript code.
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

## Development Workflow

1. **Issue Management**

   - Create GitHub Issues for features, bugs, and improvements
   - Organize issues into milestones
   - Question every requirement critically
   - Break down large issues into smaller, manageable tasks

2. **Development Cycle**

   - Choose an issue to work on
   - Create a feature branch: `git checkout -b feature/issue-description`
   - Apply Test-Driven Development (TDD):
     a. Write failing tests
     b. Implement minimum code to pass tests
     c. Refactor while maintaining passing tests
   - Push changes regularly: `git push origin feature/issue-description`

3. **Code Review and Merging**

   - Look for potential improvements or missed cases
   - Ensure all tests pass and update documentation
   - Merge into main when ready
   - Delete the feature branch

4. **Testing**

   - Write unit tests for all new functionality
   - Aim for high test coverage (e.g., 80% or higher)
   - Run the full test suite before pushing changes

5. **Continuous Deployment**

   - Utilize Vercel's built-in deployment features
   - Automatic deployments triggered by pushes to the main branch
   - Monitor deployments through Vercel dashboard

6. **Documentation**

   - Keep README.md up-to-date
   - Use JSDoc comments for all functions, classes, and modules
   - Update this AI.MD with any process changes

7. **Code Quality**

   - Use ESLint and Prettier for code formatting and linting
   - Implement static type checking with TypeScript
   - Set up pre-commit hooks for automated checks

8. **Dependency Management**

   - Regularly update dependencies
   - Use npm audit to manage dependencies and check for security vulnerabilities

9. **Version Control**

   - Use meaningful commit messages
   - Keep commits small and focused

10. **Deployment**
    - Use Vercel for automatic deployments
    - Set up staging and production environments

## Continuous Improvement

This document and our workflow are adaptable. As the project evolves, we may adjust our processes and practices. Always look for ways to simplify, optimize, and accelerate our development cycle without compromising quality.

## Recent Updates

1. Dark Mode Implementation:

   - Tailwind CSS configured for dark mode
   - ThemeToggle component created
   - Dark mode styles applied to existing pages
   - User preference persistence implemented

2. Layout Update:
   - Fixed issue with missing `<slot />` in +layout.svelte

Remember to apply Elon Musk's efficiency principles throughout the development process.

Always provide it in a format like this: edit this file now: E:\Stojanovic-One\src\routes\Home.svelte or create this file in this path: E:\Stojanovic-One\src\routes\Home.svelte
