# AI.MD - Project Collaboration Guide

## Project Overview

This project is a SvelteKit Full-Stack Solution, focusing on best practices in software development, including Test-Driven Development (TDD) and continuous integration. It features a dark mode implementation and uses Supabase for authentication and database management. The project includes two main subprojects: an Investment Analysis Platform and a Clothing Outfit Calculator.

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
- State Management: Svelte stores
- Image Compression: Custom utility (imageCompression.ts)
- Drag and Drop: svelte-dnd-action library

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
│ │ │ ├── AddStockForm.svelte
│ │ │ ├── BuyReadyComponent.svelte
│ │ │ ├── ClothingGallery.svelte
│ │ │ ├── ClothingItemUpload.svelte
│ │ │ ├── CompanyInfo.svelte
│ │ │ ├── CompanyInfoCard.svelte
│ │ │ ├── DueDiligenceComponent.svelte
│ │ │ ├── ErrorMessage.svelte
│ │ │ ├── FileUploader.svelte
│ │ │ ├── LoadingSpinner.svelte
│ │ │ ├── OutfitCreator.svelte
│ │ │ ├── ProgressBar.svelte
│ │ │ ├── QuestionList.svelte
│ │ │ ├── Sidebar.svelte
│ │ │ ├── StockItem.svelte
│ │ │ ├── SubprojectCard.svelte
│ │ │ ├── ThemeToggle.svelte
│ │ │ ├── TooExpensiveComponent.svelte
│ │ │ └── WatchlistComponent.svelte
│ │ ├── constants\
│ │ │ └── listNames.ts
│ │ ├── stores\
│ │ │ └── sessionStore.ts
│ │ ├── types\
│ │ │ └── index.ts
│ │ ├── utils\
│ │ │ ├── imageCompression.ts
│ │ │ └── stockMoves.ts
│ │ ├── index.ts
│ │ └── supabaseClient.ts
│ └── routes\
│ ├── +layout.svelte
│ ├── +layout.ts
│ ├── +page.svelte
│ ├── auth\
│ │ └── callback\
│ │ └── +server.ts
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
│ ├── +page.svelte
│ ├── meta-questions\
│ │ └── +page.svelte
│ └── [listName]\
│ └── [symbol]\
│ └── +page.svelte
├── static\
│ ├── favicon.png
│ └── google-logo.svg
├── svelte.config.js
├── tailwind.config.ts
├── tsconfig.json
├── vite.config.ts
└── .env

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

1. Dark Mode Compatibility - always implement dark mode first
2. Responsive Design - ensure the design is responsive and works well on Desktop
3. Modern and Beautiful UI - ensure the design is modern and beautiful
4. Accessibility - ensure the design is usable no matter if you zoom in via CTRL + mouse wheel or not

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

- Edit this file: E:\Stojanovic-One\src\routes\+page.svelte
- Create this file: E:\Stojanovic-One\src\components\NewComponent.svelte

This ensures clarity and prevents confusion when working with multiple files across the whole project.

## Main Routes and Components

- Home: E:\Stojanovic-One\src\routes\+page.svelte
- Login: E:\Stojanovic-One\src\routes\login\+page.svelte
- Register: E:\Stojanovic-One\src\routes\register\+page.svelte
- Profile: E:\Stojanovic-One\src\routes\profile\+page.svelte
- Clothing Outfit Calculator: E:\Stojanovic-One\src\routes\subprojects\clothing-outfit-calculator\+page.svelte
- Investment Analysis Platform: E:\Stojanovic-One\src\routes\subprojects\investment-analysis-platform\+page.svelte
- Investment Analysis Platform (Stock Detail): E:\Stojanovic-One\src\routes\subprojects\investment-analysis-platform\[listName]\[symbol]\+page.svelte
- Meta Questions: E:\Stojanovic-One\src\routes\subprojects\investment-analysis-platform\meta-questions\+page.svelte

Components:

- AddStockForm: E:\Stojanovic-One\src\lib\components\AddStockForm.svelte
- BuyReadyComponent: E:\Stojanovic-One\src\lib\components\BuyReadyComponent.svelte
- CompanyInfo: E:\Stojanovic-One\src\lib\components\CompanyInfo.svelte
- CompanyInfoCard: E:\Stojanovic-One\src\lib\components\CompanyInfoCard.svelte
- DueDiligenceComponent: E:\Stojanovic-One\src\lib\components\DueDiligenceComponent.svelte
- ErrorMessage: E:\Stojanovic-One\src\lib\components\ErrorMessage.svelte
- LoadingSpinner: E:\Stojanovic-One\src\lib\components\LoadingSpinner.svelte
- OutfitCreator: E:\Stojanovic-One\src\lib\components\OutfitCreator.svelte
- ProgressBar: E:\Stojanovic-One\src\lib\components\ProgressBar.svelte
- QuestionList: E:\Stojanovic-One\src\lib\components\QuestionList.svelte
- Sidebar: E:\Stojanovic-One\src\lib\components\Sidebar.svelte
- StockItem: E:\Stojanovic-One\src\lib\components\StockItem.svelte
- SubprojectCard: E:\Stojanovic-One\src\lib\components\SubprojectCard.svelte
- ThemeToggle: E:\Stojanovic-One\src\lib\components\ThemeToggle.svelte
- TooExpensiveComponent: E:\Stojanovic-One\src\lib\components\TooExpensiveComponent.svelte
- WatchlistComponent: E:\Stojanovic-One\src\lib\components\WatchlistComponent.svelte

Stores:

- Session Store: E:\Stojanovic-One\src\lib\stores\sessionStore.ts

Utilities:

- Image Compression: E:\Stojanovic-One\src\lib\utils\imageCompression.ts
- Stock Moves: E:\Stojanovic-One\src\lib\utils\stockMoves.ts

Supabase Client:

- E:\Stojanovic-One\src\lib\supabaseClient.ts

## Drag and Drop Functionality

The project uses the `svelte-dnd-action` library to implement drag and drop functionality. This allows users to reorder items within lists and move items between different lists.

When implementing or modifying drag and drop features, ensure to:

1. Import the `dndzone` action from `svelte-dnd-action`
2. Use the `use:dndzone` directive on the container element
3. Implement `consider` and `finalize` event handlers
4. Update the database when items are reordered or moved

## Investment Analysis Platform

The Investment Analysis Platform is a key feature of this project. It includes:

1. Multiple lists for categorizing stocks (Watchlist, Due Diligence, Buy Ready, etc.)
2. Detailed stock analysis pages with components for different analysis stages
3. Meta questions management for customizing analysis criteria
4. Company information management

## Clothing Outfit Calculator

The Clothing Outfit Calculator is another subproject that allows users to:

1. Upload and manage clothing items
2. Create and save outfits
3. View a gallery of clothing items
4. Compress images before upload for better performance

## Authentication and Authorization

The project uses Supabase for authentication, including Google Sign-In. Ensure that all protected routes check for user authentication before allowing access.

## Deployment

The project is deployed on Vercel. The production URL is https://stojanovic-one.vercel.app. Preview deployments are created for each pull request and commit.

## Performance Considerations

1. Use image compression for uploaded images
2. Implement lazy loading for components and routes where appropriate
3. Optimize database queries to minimize load times

## Security

1. Implement proper input validation and sanitization
2. Use Supabase Row Level Security (RLS) policies to protect data
3. Keep all dependencies up-to-date and regularly check for vulnerabilities

Remember to update this AI.MD file as the project evolves and new features or best practices are implemented.
