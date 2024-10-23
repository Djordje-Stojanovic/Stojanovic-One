# AI.MD - Project Collaboration Guide

## Project Overview

This project is a SvelteKit Full-Stack Solution, focusing on best practices in software development, including Test-Driven Development (TDD) and continuous integration. It features a dark mode implementation and uses Supabase for authentication and database management. The project includes two main subprojects: an Investment Analysis Platform and a Clothing Outfit Calculator.

## Full File Paths

Always provide file paths in this format:

- Edit this file: `E:\Stojanovic-One\src\routes\+page.svelte`
- Create this file: `E:\Stojanovic-One\src\components\NewComponent.svelte`

## Technology Stack

- **Frontend & Backend**: SvelteKit
- **Database**: PostgreSQL (via Supabase)
- **UI Styling**: Tailwind CSS
- **Deployment**: Vercel
- **Authentication**: Supabase Auth
- **State Management**: Svelte stores
- **Image Compression**: Custom utility (`imageCompression.ts`)
- **Drag and Drop**: `svelte-dnd-action` library
- **Rich Text Editor**: Quill via `svelte-quill`

## Project Structure

```
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
│   ├── app.css
│   ├── app.d.ts
│   ├── app.html
│   ├── lib\
│   │   ├── components\
│   │   │   ├── AddStockForm.svelte
│   │   │   ├── BuyReadyComponent.svelte
│   │   │   ├── ClothingGallery.svelte
│   │   │   ├── ClothingItemUpload.svelte
│   │   │   ├── CompanyInfo.svelte
│   │   │   ├── CompanyInfoCard.svelte
│   │   │   ├── DueDiligenceComponent.svelte
│   │   │   ├── ErrorMessage.svelte
│   │   │   ├── FileUploader.svelte
│   │   │   ├── **WikiSection.svelte**
│   │   │   ├── LoadingSpinner.svelte
│   │   │   ├── OutfitCreator.svelte
│   │   │   ├── ProgressBar.svelte
│   │   │   ├── QuestionList.svelte
│   │   │   ├── Sidebar.svelte
│   │   │   ├── StockItem.svelte
│   │   │   ├── SubprojectCard.svelte
│   │   │   ├── ThemeToggle.svelte
│   │   │   ├── TooExpensiveComponent.svelte
│   │   │   └── WatchlistComponent.svelte
│   │   ├── constants\
│   │   │   └── listNames.ts
│   │   ├── stores\
│   │   │   └── sessionStore.ts
│   │   ├── types\
│   │   │   └── index.ts
│   │   ├── utils\
│   │   │   ├── imageCompression.ts
│   │   │   └── stockMoves.ts
│   │   ├── index.ts
│   │   └── supabaseClient.ts
│   ├── routes\
│   │   ├── api\
│   │   │   ├── check-isin\
│   │   │   │   └── +server.ts
│   │   │   ├── check-symbol\
│   │   │   │   └── +server.ts
│   │   │   └── fetch-stock-data\
│   │   │       └── +server.ts
│   │   ├── auth\
│   │   │   └── callback\
│   │   │       └── +server.ts
│   │   ├── login\
│   │   │   └── +page.svelte
│   │   ├── outfit-creator\
│   │   │   └── +page.svelte
│   │   ├── profile\
│   │   │   └── +page.svelte
│   │   ├── register\
│   │   │   └── +page.svelte
│   │   ├── subprojects\
│   │   │   ├── investment-analysis-platform\
│   │   │   │   ├── +page.svelte
│   │   │   │   ├── company\
│   │   │   │   │   └── [symbol]\
│   │   │   │   │       └── +page.svelte
│   │   │   │   ├── global-lookup\
│   │   │   │   │   └── +page.svelte
│   │   │   │   └── meta-questions\
│   │   │   │       └── +page.svelte
│   │   │   └── outfit-calculator\
│   │   │       └── +page.svelte
│   │   └── +layout.svelte
│   └── supabase\
│       └── migrations\
├── static\
└── svelte.config.js
```

## Elon Musk's Algorithm for Efficiency

Apply these principles throughout the development process:

1. Question every requirement
2. Delete unnecessary parts
3. Simplify and optimize
4. Accelerate cycle time of development
5. Automate

The Investment Analysis Platform is a key feature of this project. It includes:

1. **Company Wiki Sections**:

   - **New Feature**: Users can view and edit sections such as "History," "Business Model," "Competitors," and "Risks" for each company.
   - **Component**: `WikiSection.svelte`
   - **Functionality**:
     - Displays content pulled from the `company_wiki` table in the database.
     - Provides an edit mode where users can modify content using a rich text editor.
     - Saves updated content back to the database.
     - Shows who last updated the content.
   - **Rich Text Editor**:
     - Integrated Quill editor via the `svelte-quill` library.
     - Supports text formatting (bold, italic, underline, strike-through).
     - Supports headers (H1, H2, H3), links, and images.
     - Custom styling to match the application theme, including adjustments for dark mode.
   - **Database**:
     - Table: `company_wiki`
     - Fields: `symbol`, `section`, `content`, `user_id`, `updated_at`
   - **Authentication**:
     - Only authenticated users can edit content.
     - User ID is stored with each content update to track changes.

2. **Multiple Lists for Categorizing Stocks**:

   - Watchlist, Due Diligence, Buy Ready, etc.
   - Uses draggable lists with the `svelte-dnd-action` library.
   - Allows users to reorder items and move stocks between lists.
   - Changes are persisted to the database.

3. **Detailed Stock Analysis Pages**:

   - Components for different analysis stages.
   - Integrates with the Finnhub API to fetch real-time stock data.
   - Displays company information and stock performance.

4. **Meta Questions Management**:

   - Allows users to customize analysis criteria.
   - Stores questions and answers in the `questions` and `answers` tables.
   - Dynamic rendering of questions based on categories.

5. **Company Information Management**:

   - Components like `CompanyInfo.svelte` and `CompanyInfoCard.svelte` display detailed company data.
   - Uses the Parqet API to fetch company logos.

## Clothing Outfit Calculator

The Clothing Outfit Calculator allows users to:

1. **Upload and Manage Clothing Items**:

   - Users can upload images of clothing items.
   - Images are compressed before upload using a custom utility (`imageCompression.ts`).
   - Metadata about the clothing item (e.g., type, color) can be stored.

2. **Create and Save Outfits**:

   - Users can mix and match clothing items to create outfits.
   - Outfits can be saved for future reference.

3. **View a Gallery of Clothing Items**:

   - Displays all uploaded clothing items in a gallery format.
   - Allows filtering and sorting of items.

## Rich Text Editing with Quill

The project incorporates rich text editing capabilities using Quill via the `svelte-quill` library.

- **Integration**:

  - Imported Quill styles in `src/routes/+layout.svelte`:
    ```javascript
    import 'quill/dist/quill.snow.css';
    ```

- **Usage**:

  - Used in the `WikiSection.svelte` component.
  - Provides an intuitive interface for editing wiki sections.

- **Customization**:

  - Custom toolbar options are set in `quillOptions`.
  - History module is configured for undo/redo functionality.
  - Styling adjustments are made to match the application's theme.

## Authentication and Authorization

The project uses Supabase for authentication, including Google Sign-In.

- **Protected Routes**:

  - All protected routes check for user authentication before allowing access.
  - Example: The `profile` page redirects to `/login` if the user is not authenticated.

- **Session Management**:

  - Session data is managed using Svelte stores (`sessionStore.ts`).
  - The session is updated on authentication state changes.

## Deployment

The project is deployed on Vercel.

- **Production URL**: [https://stojanovic-one.vercel.app](https://stojanovic-one.vercel.app)

- **Deployment Process**:

  - Pushes to the main branch trigger automatic deployments.
  - Environment variables are managed securely.

## Performance Considerations

1. **Image Compression**:

   - Images are compressed before upload to improve load times.
   - Utilizes the `imageCompression.ts` utility.

2. **Lazy Loading**:

   - Components and routes are lazy-loaded where appropriate.
   - Improves initial page load performance.

3. **Database Optimization**:

   - Queries are optimized to minimize load times.
   - Indexes are used in the database to speed up query performance.

## Security

1. **Input Validation and Sanitization**:

   - User inputs are validated on both client and server sides.
   - Sanitization prevents injection attacks.

2. **Supabase Row Level Security (RLS) Policies**:

   - RLS policies are implemented to protect data.
   - Ensures users can only access their own data.

3. **Dependency Management**:

   - Dependencies are kept up-to-date.
   - Regular checks for vulnerabilities are performed.

## Recent Updates

### Company Wiki Sections

- **Feature Addition**:

  - Implemented editable wiki sections for companies.
  - Allows for collaborative input and knowledge sharing.

- **Technical Details**:

  - **Component**: `WikiSection.svelte`
  - **Database**: Added `company_wiki` table.
  - **Editor Integration**: Used `svelte-quill` for rich text editing.

- **User Experience**:

  - Users can view and edit company-related information.
  - Edits are saved to the database and displayed in real-time.
  - Displays the name of the last user who updated the content.

### Database and API Changes

- **Stock Data Management**:

  - Replaced the `stock_items` table with `stock_metadata` and `user_stocks` tables for better data organization.
  - Updated data fetching logic to accommodate new table structures.

- **API Integrations**:

  - **Finnhub API**: Now used to fetch stock data when adding new stocks.
  - **Parqet API**: Used to fetch stock logos.

- **New Tables**:

  - `company_info`: Stores additional company information.
  - `company_wiki`: Stores wiki content for companies.
  - `questions` and `answers`: Implemented for the investment analysis process.

- **API Endpoints**:

  - `src/routes/api/fetch-stock-data/+server.ts`: Handles fetching and storing new stock data.
  - `src/routes/api/check-isin/+server.ts`: Validates ISIN numbers.
  - `src/routes/api/check-symbol/+server.ts`: Validates stock symbols.

Remember to update this AI.MD file as the project evolves and new features or best practices are implemented.

---

Please ensure all future updates are reflected here to keep the team informed and maintain consistency across the project.
