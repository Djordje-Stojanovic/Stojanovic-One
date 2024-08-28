# AI.MD - Project Collaboration Guide

## Project Overview

This project is a SvelteKit Full-Stack Solution, focusing on best practices in software development, including Test-Driven Development (TDD) and continuous integration. It features a dark mode implementation and uses Supabase for authentication and database management.

## Full File Paths

Always provide file paths in this format:

- Edit this file: E:\Stojanovic-One\src\routes\+page.svelte
- Create this file: E:\Stojanovic-One\src\components\NewComponent.svelte

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
│ │ │ ├── ClothingGallery.svelte
│ │ │ ├── ClothingItemUpload.svelte
│ │ │ ├── ErrorMessage.svelte
│ │ │ ├── LoadingSpinner.svelte
│ │ │ ├── OutfitCreator.svelte
│ │ │ ├── SubprojectCard.svelte
│ │ │ └── ThemeToggle.svelte
│ │ ├── stores\
│ │ │ └── sessionStore.ts
│ │ ├── types\
│ │ │ └── index.ts
│ │ ├── utils\
│ │ │ └── imageCompression.ts
│ │ ├── index.ts
│ │ └── supabaseClient.ts
│ └── routes\
│ ├── +layout.svelte
│ ├── +layout.ts
│ ├── +page.svelte
│ ├── login\
│ │ └── +page.svelte
│ ├── profile\
│ │ └── +page.svelte
│ ├── register\
│ │ └── +page.svelte
│ └── subprojects\
│ ├── clothing-outfit-calculator\
│ │ └── +page.svelte
│ └── investment-analysis-platform\
│ └── +page.svelte
├── static\
│ ├── favicon.png
│ └── google-logo.svg
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

## Design and User Experience Guidelines

1. Dark Mode Compatibility
2. Mobile-Friendly and Responsive Design
3. Performance Optimization
4. Modern and Beautiful UI
5. Accessibility

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
     A. Implement minimum code to pass tests
     B. Refactor while maintaining passing tests
   - Push changes regularly: `git push origin feature/issue-description`

3. **Code Review and Merging**

   - Look for potential improvements or missed cases
   - Ensure all tests pass and update documentation
   - Merge into main when ready
   - Delete the feature branch

4. **Continuous Deployment**

   - Utilize Vercel's built-in deployment features
   - Automatic deployments triggered by pushes to the main branch
   - Monitor deployments through Vercel dashboard

5. **Documentation**

   - Keep README.md up-to-date
   - Use JSDoc comments for all functions, classes, and modules
   - Update this AI.MD with any process changes

6. **Code Quality**

   - Use ESLint and Prettier for code formatting and linting
   - Implement static type checking with TypeScript
   - Set up pre-commit hooks for automated checks

7. **Dependency Management**

   - Regularly update dependencies
   - Use npm audit to manage dependencies and check for security vulnerabilities

8. **Version Control**

   - Use meaningful commit messages
   - Keep commits small and focused

9. **Deployment**
   - Use Vercel for automatic deployments
   - Set up staging and production environments

## Continuous Improvement

This document and our workflow are adaptable. As the project evolves, we may adjust our processes and practices. Always look for ways to simplify, optimize, and accelerate our development cycle without compromising quality.

Remember to apply Elon Musk's efficiency principles throughout the development process.

## File Path Importance

When referencing, editing, or creating files, always use the full file path. For example:

- Edit this file: E:\Stojanovic-One\src\routes\Home.svelte
- Create this file: E:\Stojanovic-One\src\components\NewComponent.svelte

This ensures clarity and prevents confusion when working with multiple files across the whole project.

## Main Routes and Components

- Home: E:\Stojanovic-One\src\routes\+page.svelte
- Login: E:\Stojanovic-One\src\routes\login\+page.svelte
- Register: E:\Stojanovic-One\src\routes\register\+page.svelte
- Profile: E:\Stojanovic-One\src\routes\profile\+page.svelte
- Clothing Outfit Calculator: E:\Stojanovic-One\src\routes\subprojects\clothing-outfit-calculator\+page.svelte
- Investment Analysis Platform: E:\Stojanovic-One\src\routes\subprojects\investment-analysis-platform\+page.svelte

Components:

- SubprojectCard: E:\Stojanovic-One\src\lib\components\SubprojectCard.svelte
- ErrorMessage: E:\Stojanovic-One\src\lib\components\ErrorMessage.svelte
- LoadingSpinner: E:\Stojanovic-One\src\lib\components\LoadingSpinner.svelte
- ThemeToggle: E:\Stojanovic-One\src\lib\components\ThemeToggle.svelte

Stores:

- Session Store: E:\Stojanovic-One\src\lib\stores\sessionStore.ts

Supabase Client:

- E:\Stojanovic-One\src\lib\supabaseClient.ts
