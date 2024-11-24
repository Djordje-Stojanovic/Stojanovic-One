# AI.MD - Project Collaboration Guide

## Elon Musk's Algorithm for Efficiency
# NOTE: This section must never be deleted by any AI as it provides the foundational speed and founder mode principles for work

1. Question every requirement
   - Is this feature truly necessary?
   - Does it solve a real user problem?
   - Can we achieve the same result with existing features?
   - ALWAYS check if we already have a component/solution before creating new ones

2. Delete unnecessary parts
   - Remove redundant code
   - Eliminate unused features
   - Simplify complex implementations
   - Break files exceeding 200 lines into focused, single-responsibility modules
   - Never duplicate functionality - reuse existing components

3. Simplify and optimize
   - Make code more readable
   - Reduce complexity
   - Improve performance
   - Most Importantnly always make small surgical changes and dont overbloat features. Never introduce code that breaks the app.

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

## Database Access

### Architecture Overview
- Auth: Hosted Supabase (ztwbgnoykjmhqcooiosr.supabase.co)
  - Used for authentication only
  - Google OAuth and email auth
  - Session management
  - Auth client in supabaseClient.ts

- Database: Self-hosted Supabase on Hetzner VPS via Coolify
  - All data operations
  - Better control and performance
  - Lower costs
  - Database client in supabaseClient.ts

### Database Operations
The `ladab` CLI tool provides comprehensive database access. AI can use this tool to easily query and manipulate data when programming:

```bash
# Core Commands
ladab ls [table]              # List tables or contents
ladab get <table> [options]   # Get records with filtering
ladab add <table> [json]      # Add records
ladab del <table> [query]     # Delete records
ladab up <table> [query]      # Update records
ladab count <table> [query]   # Count records

# Get Command Options
-l, --limit <n>      # Limit number of records
-f, --offset <n>     # Skip/offset records
-o, --order <col>    # Order by column
-d, --desc           # Order descending
-w, --where <cond>   # Filter records (e.g. "symbol=eq.AAPL")
-s, --select <cols>  # Select specific columns
-j, --join <spec>    # Join with other tables
-g, --group <cols>   # Group by columns

# Schema Commands
ladab schema ls               # List all schemas
ladab schema info <table>     # Get table info
ladab schema fk <table>       # List foreign keys
ladab schema refs <table>     # List references
ladab schema cols <table>     # List columns
ladab schema indexes <table>  # List indexes

# RLS Commands
ladab rls ls [table]          # List policies
ladab rls add <table>         # Add policy
ladab rls del <table>         # Delete policy
ladab rls enable <table>      # Enable RLS
ladab rls disable <table>     # Disable RLS
ladab rls test <table>        # Test policies

# Examples
# Basic queries
ladab get stock_metadata -w "symbol=eq.AAPL" -s "symbol,company_name,price"  # Get specific AAPL fields
ladab get users -l 5 -o created_at -d                                        # Get 5 newest users

# Using 'myself' shortcut for user_id
ladab get user_stocks -w "user_id=myself"  # Get all your stocks

# Join query with nested selects
ladab get user_stocks \
  -w "user_id=myself" \
  -s "list_name,stock_metadata(symbol,ceo,company_name,price)"

# This returns:
# {
#   "list_name": "Core Holdings",
#   "stock_metadata": {
#     "symbol": "GOOGL",
#     "ceo": "Mr. Sundar Pichai",
#     "company_name": "Alphabet Inc.",
#     "price": 164.76
#   }
# }
```

### Code Examples
```typescript
// Auth operations (hosted Supabase)
import { supabase } from '$lib/supabaseClient';
const { data: { user } } = await supabase.auth.getUser(token);

// Database operations (VPS Supabase)
import { db } from '$lib/supabaseClient';
const { data, error } = await db
    .from('table_name')
    .select('*')
    .limit(10);
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
- Use service role key for database operations that need elevated privileges
- Use anon key for regular database operations

### Performance
- Lazy load components
- Optimize queries using proper indexes
- Implement caching strategies
- Compress assets
- Use connection pooling for database
- Implement proper error boundaries

## Tech Stack & Structure
```
Frontend & Backend: SvelteKit
Database: PostgreSQL (self-hosted via Coolify)
UI: Tailwind CSS
Auth: Supabase (hosted)
State: Svelte stores

src/
├── lib/
│   ├── components/    # UI components
│   ├── stores/        # State management
│   ├── utils/         # Helpers
│   ├── db/           # Database schema and connection
│   └── types/        # TypeScript types
└── routes/           # App routes
```

Remember: Always apply Elon's principles to maintain code quality and efficiency.
