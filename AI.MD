# AI.MD - Project Collaboration Guide

## Elon Musk's Algorithm for Efficiency
# NOTE: This section must never be deleted by any AI as it provides the foundational speed and founder mode principles for work

1. Question every requirement
   - Is this feature truly necessary?
   - Does it solve a real user problem?
   - Can we achieve the same result with existing features?

2. Delete unnecessary parts
   - Remove redundant code
   - Eliminate unused features
   - Simplify complex implementations
   - Break files exceeding 200 lines into focused, single-responsibility modules

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

## State Management

### Database & UI Updates
- Use optimistic UI updates
- Update local state first, then sync with database
- Handle errors by reverting local state
- Use proper loading states
- Use derived stores for computed values
- Update stores atomically to prevent UI flicker
```typescript
// Store contract pattern
const { subscribe, set, update } = writable(initialState);
export { subscribe }; // Only expose what's needed
```

## UI/UX Standards

### Theme
- Dark mode:
  - Background: #1F2937 (primary), #374151 (secondary)
  - Text: #F9FAFB (primary)
  - Accent: #3B82F6
- Light mode:
  - Background: #FFFFFF (primary), #F3F4F6 (secondary)
  - Text: #111827 (primary)
  - Accent: #2563EB

### Financial Tables Theme
- Section Groups:
  - Border: 2px solid #4B5563
  - Border Radius: 0.375rem
  - Margin Bottom: 1.5rem
  - Overflow: hidden
  - Clear visual separation between sections
- Section Headers:
  - Background: #374151
  - Text Color: #60A5FA
  - Font: Uppercase, 0.75rem, letter-spacing: 0.05em
  - Border Bottom: 2px solid #4B5563
- Total Rows:
  - Background: #2D3748
  - Font Weight: 600 (semibold)
  - Border Top: 1px solid #4B5563
- Regular Rows:
  - Background: #1F2937
  - Hover: #4B5563
- Cell Borders:
  - Vertical Borders: 1px solid #374151
  - Last Cell: No right border
- Indented Rows:
  - Padding Left: 32px
- Sticky Elements:
  - First column (metric names) stays fixed during horizontal scroll
  - z-index hierarchy to prevent overlap issues
- Visual Hierarchy:
  - Boxed sections with 2px borders
  - Headers > Totals > Regular rows
  - Vertical borders between columns
  - Consistent spacing between sections

### Design System
- Spacing: 0.5rem, 1rem, 1.5rem, 2rem
- Border radius: 0.375rem
- Transitions: 300ms
- Shadows: light: 0 1px 3px rgba(0,0,0,0.1), dark: 0 1px 3px rgba(0,0,0,0.3)

## Development Guidelines

### Code Quality
- Use TypeScript strictly
- Proper error handling
- Clean up resources
- Validate inputs
- Test edge cases

### Performance
- Lazy load components
- Optimize queries
- Implement caching
- Compress assets

## Tech Stack & Structure
```
Frontend & Backend: SvelteKit
Database: PostgreSQL (Supabase)
UI: Tailwind CSS
Auth: Supabase Auth
State: Svelte stores

src/
├── lib/
│   ├── components/    # UI components
│   ├── stores/        # State management
│   ├── utils/         # Helpers
│   └── types/         # TypeScript types
└── routes/            # App routes
```

Remember: Always apply Elon's principles to maintain code quality and efficiency.
