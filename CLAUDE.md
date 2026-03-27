# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Keep replies extremely concise and focus on conveying key information. No unnecessary fluff, no long code snippets.

When working with any third party library, you MUST look up the official documentation to ensure you are working with up-to-date information. Use the DocsExplorer subagent for efficient documentation lookup.

## Project Overview

**Pocket Heist** is a Next.js application built for the Claude Code Masterclass. Themed around "tiny missions" and "office mischief."

## Development Commands

```bash
npm install         # Install dependencies
npm run dev         # Development server (http://localhost:3000)
npm run build       # Production build
npm start           # Start production server
npm run lint        # Run linter
npm test            # Run tests (Vitest)
npm test -- --watch                    # Watch mode
npm test -- path/to/test.test.tsx      # Single test file
```

## Architecture

### Next.js App Router with Route Groups

- **(public)**: Unauthenticated pages — `/`, `/login`, `/signup`, `/preview`
- **(dashboard)**: Authenticated pages — `/heists`, `/heists/create`, `/heists/[id]`

The `(public)` layout adds `className="public"`; the `(dashboard)` layout includes the Navbar.

### Firebase

`lib/firebase.ts` initializes Firebase and exports `auth` (Firebase Auth) and `db` (Firestore). Import from `@/lib/firebase`.

**Environment Variables**: Firebase requires the following environment variables in `.env.local`:
```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
```

**Firestore Rules**: `firestore.rules` contains security rules. Current rules are time-limited (expires April 8, 2026) and should be updated for production.

### Auth State (`lib/auth`)

`lib/auth` provides client-side auth state management:
- `AuthProvider` — wraps the app via `app/providers.tsx` (a `"use client"` boundary needed for the Server Component root layout)
- `useUser()` — returns `{ user: User | null, loading: boolean }` from Firebase `onAuthStateChanged`
- Import from `@/lib/auth`

### Directory Structure

```
app/
  (public)/          # Public pages and layout
  (dashboard)/       # Dashboard pages and layout with Navbar
  layout.tsx         # Root layout (Server Component; wraps with <Providers>)
  providers.tsx      # Client boundary wrapping AuthProvider
  globals.css        # Global styles (Tailwind imports + theme tokens)
components/          # Shared React components (barrel export pattern)
lib/
  firebase.ts        # Firebase init; exports auth, db
  auth/              # Auth context, useUser hook, types
tests/               # Test files mirroring app/components structure
_specs/              # Feature specs (markdown)
_plans/              # Feature implementation plans (markdown)
```

### Import Paths

Use `@/*` alias for all internal imports (maps to project root):
```typescript
import { auth, db } from "@/lib/firebase"
import { useUser } from "@/lib/auth"
import Navbar from "@/components/Navbar"
```

### Styling

- **Tailwind CSS 4** via `@tailwindcss/postcss`
- Theme tokens in `globals.css` under `@theme`: `primary`, `secondary`, `dark`, `light`, `lighter`, `success`, `error`, `heading`, `body`
- CSS Modules for component styles; reference globals with `@reference "../../app/globals.css"`
- Global utilities: `.page-content`, `.center-content`, `.form-title`
- Font: Inter (Google Fonts)

### Component Conventions

- Components live in `components/<Name>/` with `index.ts` barrel export, `<Name>.tsx`, and optional `<Name>.module.css`
- Icons from `lucide-react`

### Testing Setup

- **Framework**: Vitest + jsdom
- **Library**: React Testing Library + jest-dom (auto-imported via `vitest.setup.ts`)
- **Globals**: `describe`, `it`, `expect` available globally without imports
- **Config**: `tsconfigPaths` plugin resolves `@/*` aliases in tests

## Coding Preferences

- No semicolons in JS/TS
- No Tailwind classes directly in templates unless just one; use `@apply` for multiple classes
- Minimal dependencies
- Functional components and React hooks only; no class components
- React components to use barrel export pattern
- Create Reusable components where possible; avoid one-off components
- Use TypeScript with strict types; prefer interfaces and type aliases over `type` when defining object shapes
- No `any` type; prefer specific types or generics
- Use `git switch -c` for new branches (not `git checkout`)
