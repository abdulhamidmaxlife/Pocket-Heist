# CLAUDE.md

Keep your replies extermly consise and focus on conveying the key information. No unnecessary fluff, no long code snippets.

When working with any third party library or something similar, you MUST look up the official documentation to ensure that you are working with up-to-date information.
Use the DocsExplorer subagent for efficient documentation lookup.

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Pocket Heist** is a Next.js application built for the Claude Code Masterclass. The app is themed around "tiny missions" and "office mischief."

## Development Commands

```bash
# Install dependencies
npm install

# Development server (runs on http://localhost:3000)
npm run dev

# Production build
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Run tests (Vitest)
npm test

# Run tests in watch mode
npm test -- --watch

# Run a specific test file
npm test -- path/to/test.test.tsx
```

## Architecture

### Next.js App Router with Route Groups

The application uses Next.js 16 App Router with route groups to organize pages:

- **(public)**: Unauthenticated pages
  - `/` - Landing page
  - `/login` - Login page
  - `/signup` - Signup page
  - `/preview` - Preview page

- **(dashboard)**: Authenticated pages
  - `/heists` - List of heists
  - `/heists/create` - Create new heist
  - `/heists/[id]` - Individual heist detail page

The `(public)` layout adds a wrapper with `className="public"`, while the `(dashboard)` layout includes the Navbar component.

### Directory Structure

```
app/
  (public)/          # Public pages and layout
  (dashboard)/       # Dashboard pages and layout with Navbar
  layout.tsx         # Root layout with HTML structure
  globals.css        # Global styles (Tailwind imports)
components/          # Shared React components
  Navbar/            # Uses index.ts barrel export pattern
tests/               # Test files (mirrors app/components structure)
  components/
public/              # Static assets
```

### Import Paths

TypeScript path alias `@/*` maps to the project root. Use it for all internal imports:

```typescript
import Navbar from "@/components/Navbar"
import { something } from "@/app/utils"
```

### Styling

- **Tailwind CSS 4** via `@tailwindcss/postcss` plugin
- Theme colors defined in `globals.css` under `@theme` (primary, secondary, dark, light, lighter, success, error, heading, body)
- Component-scoped styles use **CSS Modules** (e.g., `Navbar.module.css`), which must reference `globals.css` with `@reference "../../app/globals.css"` to access theme tokens
- Font: Inter (imported from Google Fonts)
- Global layout utilities in `globals.css`: `.page-content` (centered max-width container), `.center-content` (full-height flex column), `.form-title` (centered bold title)

### Component Conventions

- Components live in `components/<Name>/` with `index.ts` barrel export, `<Name>.tsx`, and optional `<Name>.module.css`
- Import components via `@/components/<Name>` (uses `@/*` path alias mapped to project root)
- Icons from `lucide-react`

### Testing Setup

- **Framework**: Vitest with jsdom environment
- **Library**: React Testing Library + jest-dom matchers
- **Globals**: Test functions (describe, it, expect) are available globally without imports
- **Setup**: `vitest.setup.ts` imports jest-dom matchers automatically
- **Config**: Uses `tsconfigPaths` plugin to resolve `@/*` aliases in tests
- Test files should mirror the structure of the component being tested

### Additional Coding Preferences

- Do NOT use semicolons for JavaScript or TypeScript code.
- Do NOT apply tailwind classes directly in component templates unless essential or just 1 at most. If an element needs more than
  a single tailwind class, combine them into a custom class using the `@apply` directive.
- Use minimal project dependencies where possible.
- Always prefer functional components and React hooks over class components.
- Avoid using `any` type in TypeScript; prefer specific types or generics.
- Try to create reusable components and avoid code duplication.
- Follow the existing code style and conventions used in the project for consistency.
- Use the `git switch -c` command to switch to new branches, not `git checkout`.
