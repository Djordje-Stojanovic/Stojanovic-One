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

## UI/UX Guidelines

### Color Scheme
- Use consistent color palette across all components
- Dark mode colors:
  - Background: #1F2937 (primary), #374151 (secondary)
  - Text: #F9FAFB (primary), #D1D5DB (secondary)
  - Accent: #3B82F6 (primary), #60A5FA (hover)
- Light mode colors:
  - Background: #FFFFFF (primary), #F3F4F6 (secondary)
  - Text: #111827 (primary), #4B5563 (secondary)
  - Accent: #2563EB (primary), #3B82F6 (hover)

### Layout
- Use consistent spacing (0.5rem, 1rem, 1.5rem, 2rem)
- Maintain proper hierarchy with clear visual distinction
- Implement responsive grid systems
- Use cards for content grouping
- Maintain proper padding and margins

### Components
- Use consistent border radius (0.375rem)
- Implement smooth transitions (300ms)
- Maintain proper spacing between elements
- Use shadows for depth (light: 0 1px 3px rgba(0,0,0,0.1), dark: 0 1px 3px rgba(0,0,0,0.3))

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
