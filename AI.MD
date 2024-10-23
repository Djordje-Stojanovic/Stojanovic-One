# AI.MD - Project Collaboration Guide

## Elon Musk's Algorithm for Efficiency

Apply these principles throughout the development process:

1. Question every requirement
   - Is this feature truly necessary?
   - Does it solve a real user problem?
   - Can we achieve the same result with existing features?

2. Delete unnecessary parts
   - Remove redundant code
   - Eliminate unused features
   - Simplify complex implementations

3. Simplify and optimize
   - Make code more readable
   - Reduce complexity
   - Improve performance

4. Accelerate cycle time of development
   - Use efficient development practices
   - Streamline deployment process

5. Automate
   - Automate repetitive tasks
   - Create reusable components

## Common Issues and Solutions

### State Management
- Always update Svelte stores immediately after state changes
- Use proper store subscription cleanup
- Avoid redundant store updates

### File Handling
- Implement proper file validation
- Handle file upload errors gracefully
- Clean up file resources (e.g., revoking object URLs)

### Type Safety
- Define proper TypeScript interfaces
- Use strict type checking
- Avoid any type

### Component Communication
- Use proper event dispatching
- Clean up event listeners
- Maintain proper prop types

### Performance
- Implement lazy loading
- Compress images before upload
- Use proper database indexing

## Technology Stack

- Frontend & Backend: SvelteKit
- Database: PostgreSQL (via Supabase)
- UI Styling: Tailwind CSS
- Authentication: Supabase Auth
- State Management: Svelte stores

## Project Structure

```
src/
├── lib/
│   ├── components/    # Reusable components
│   ├── stores/        # State management
│   ├── utils/         # Utility functions
│   └── types/         # TypeScript definitions
└── routes/            # Application routes
```

## Best Practices

1. File Organization
   - Use consistent naming conventions
   - Group related files together
   - Maintain clear folder structure

2. Code Style
   - Follow TypeScript best practices
   - Use proper error handling
   - Implement proper validation

3. Performance
   - Optimize database queries
   - Implement caching where appropriate
   - Use proper loading states

4. Security
   - Implement proper authentication
   - Use input validation
   - Follow security best practices

Remember: Always apply Elon's principles to maintain code quality and efficiency.
