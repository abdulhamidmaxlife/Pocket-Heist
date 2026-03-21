# Implementation Plan: Auth State Management

## Overview

Implement a global auth state management solution using React Context that listens to Firebase Authentication in real-time and exposes the current user via a `useUser` hook. This enables any component to access auth state (`null` when logged out, Firebase User object when logged in) with a loading indicator during initialization.

## Spec Reference

See `_specs/auth-state-management.md` for detailed requirements and acceptance criteria.

## Architectural Considerations

**Pattern**: React Context Provider with custom hook
- Auth state is truly global (needed across all routes)
- Updates are infrequent (only on login/logout/session changes)
- No complex state logic requiring external state management
- Aligns with Next.js App Router client/server component boundaries

**Key Decisions**:
- Use Firebase's `onAuthStateChanged` listener for real-time auth state synchronization
- Create `app/providers.tsx` as Client Component wrapper to keep root layout as Server Component
- Wrap at root layout level to provide context to both `(public)` and `(dashboard)` route groups
- Separate concerns: AuthContext (provider), useUser (consumer hook), types (interfaces)
- Follow project's barrel export pattern for clean imports

### File Structure

```
app/
└── providers.tsx         # Client Component wrapper for all providers

lib/auth/
├── index.ts              # Barrel export
├── types.ts              # TypeScript interfaces (AuthContextValue, AuthProviderProps)
├── AuthContext.tsx       # Context definition and AuthProvider component
└── useUser.ts            # Custom hook with error handling

tests/lib/auth/
├── AuthContext.test.tsx  # Provider behavior and lifecycle tests
├── useUser.test.tsx      # Hook error handling tests
└── integration.test.tsx  # End-to-end auth flow tests
```

### User Object Shape

Uses Firebase Auth's `User` type from `firebase/auth`:

```typescript
import { User } from "firebase/auth"

interface AuthContextValue {
  user: User | null        // Firebase User object or null when logged out
  loading: boolean         // true during initial auth resolution, false after
}
```

## Implementation Steps

### 1. Create Type Definitions

**File**: `lib/auth/types.ts`

```typescript
import { User } from "firebase/auth"

export interface AuthContextValue {
  user: User | null
  loading: boolean
}

export interface AuthProviderProps {
  children: React.ReactNode
}
```

### 2. Create AuthContext and Provider

**File**: `lib/auth/AuthContext.tsx`

```typescript
"use client"

import { createContext, useEffect, useState } from "react"
import { onAuthStateChanged, User } from "firebase/auth"
import { auth } from "@/lib/firebase"
import type { AuthContextValue, AuthProviderProps } from "./types"

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Subscribe to Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      setLoading(false)
    })

    // Cleanup subscription on unmount
    return () => unsubscribe()
  }, []) // Empty deps: listener only needs to be set up once

  const value: AuthContextValue = { user, loading }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
```

**Key Points**:
- `"use client"` directive required for hooks in Next.js App Router
- Initial `loading: true` prevents flash of unauthenticated content
- `onAuthStateChanged` fires immediately with current state if user is authenticated
- Cleanup function prevents memory leaks

### 3. Create useUser Hook

**File**: `lib/auth/useUser.ts`

```typescript
import { useContext } from "react"
import { AuthContext } from "./AuthContext"

export function useUser() {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error("useUser must be used within an AuthProvider")
  }

  return context
}
```

**Rationale**: Fail-fast with descriptive error if hook is used outside provider context.

### 4. Create Barrel Export

**File**: `lib/auth/index.ts`

```typescript
export { AuthProvider } from "./AuthContext"
export { useUser } from "./useUser"
export type { AuthContextValue } from "./types"
```

### 5. Create Providers Wrapper

**File**: `app/providers.tsx`

```typescript
"use client"

import { AuthProvider } from "@/lib/auth"

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return <AuthProvider>{children}</AuthProvider>
}
```

**Rationale**:
- Separates client-side provider logic from server-side root layout
- Allows root layout to remain a Server Component
- Provides a centralized location for all future providers (theme, i18n, etc.)
- Follows Next.js best practice for App Router architecture

### 6. Update Root Layout

**File**: `app/layout.tsx`

Add `Providers` wrapper:

```typescript
import type { Metadata } from "next"
import { Providers } from "./providers"
import "@/app/globals.css"

export const metadata: Metadata = {
  title: "Pocket Heist",
  description: "Tiny missions. Big office mischief.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
```

**Why root layout**: Ensures context is available to both `(public)` and `(dashboard)` route groups while keeping layout as Server Component.

### 7. Update Components to Use Auth (Example: Navbar)

**File**: `components/Navbar/Navbar.tsx`

Add auth integration:

```typescript
"use client"

import { useUser } from "@/lib/auth"
import { signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"
// ... other imports

export default function Navbar() {
  const { user, loading } = useUser()

  const handleSignOut = async () => {
    try {
      await signOut(auth)
    } catch (err) {
      console.error("Sign out error:", err)
    }
  }

  if (loading) {
    return <div className={styles.siteNav}>Loading...</div>
  }

  return (
    <div className={styles.siteNav}>
      <nav>
        {/* existing nav content */}
        {user && (
          <div>
            <span>{user.email}</span>
            <button onClick={handleSignOut}>Sign Out</button>
          </div>
        )}
      </nav>
    </div>
  )
}
```

## Testing Plan

Create three test files in `tests/lib/auth/` directory:

### Test 1: AuthContext Provider Tests

**File**: `tests/lib/auth/AuthContext.test.tsx`

Tests:
- Provider renders children successfully
- Sets `loading: false` when auth state resolves
- Updates user state when `onAuthStateChanged` fires
- Cleans up subscription on unmount

Mock setup:
```typescript
vi.mock("firebase/auth", () => ({
  onAuthStateChanged: vi.fn(),
}))

vi.mock("@/lib/firebase", () => ({
  auth: {},
  db: {},
}))
```

### Test 2: useUser Hook Tests

**File**: `tests/lib/auth/useUser.test.tsx`

Tests:
- Throws descriptive error when used outside AuthProvider
- Returns correct context value when used inside provider

### Test 3: Integration Tests

**File**: `tests/lib/auth/integration.test.tsx`

Tests:
- Full auth flow: loading → authenticated
- Full auth flow: loading → unauthenticated
- Auth state updates propagate to nested components

Testing approach:
- Use React Testing Library's `render` and `waitFor`
- Mock `onAuthStateChanged` to simulate Firebase behavior
- Verify loading states and user data flow

## Edge Cases Handled

| Edge Case | Solution |
|-----------|----------|
| Hook called outside provider | `useUser` throws descriptive error |
| App loads before Firebase resolves | `loading: true` initial state prevents UI flash |
| User session expires remotely | `onAuthStateChanged` listener updates state to `null` automatically |
| Component unmounts before auth resolves | Cleanup function prevents state updates on unmounted component |
| Memory leaks from listener | `useEffect` cleanup calls `unsubscribe()` |
| Multiple AuthProviders | Context design allows only one provider at root |

## Critical Files

| File Path | Purpose |
|-----------|---------|
| `lib/auth/AuthContext.tsx` | Core auth provider with Firebase listener |
| `lib/auth/useUser.ts` | Public API for accessing auth state |
| `lib/auth/types.ts` | TypeScript interfaces |
| `app/providers.tsx` | Client Component wrapper for providers |
| `app/layout.tsx` | Integration point - wraps app with Providers |
| `lib/auth/index.ts` | Barrel export for clean imports |
| `tests/lib/auth/AuthContext.test.tsx` | Provider lifecycle tests |
| `tests/lib/auth/useUser.test.tsx` | Hook error handling tests |

## Verification Steps

### Automated Tests
```bash
npm test tests/lib/auth
```

Expected: All tests pass with coverage for:
- Provider initialization
- Auth state updates
- Hook error handling
- Integration flows

### Manual Testing

1. **Initial Load**
   - Open app at `http://localhost:3000`
   - Verify brief loading state (no flash of wrong content)
   - Verify correct UI based on auth state

2. **Login Flow** (requires functional LoginForm)
   - Navigate to `/login`
   - Submit credentials
   - Verify redirect on success
   - Verify Navbar shows user data

3. **Auth Persistence**
   - Login, then refresh page
   - Verify user stays logged in
   - Verify minimal/no loading flicker

4. **Logout Flow** (after Navbar integration)
   - Click sign out
   - Verify immediate UI update
   - Verify redirect to public route

5. **Developer Experience**
   - Import hook: `import { useUser } from "@/lib/auth"`
   - Use in component: `const { user, loading } = useUser()`
   - Verify TypeScript autocomplete works
   - Verify error when hook used outside provider

6. **React DevTools**
   - Inspect component tree
   - Verify Providers component wraps entire app
   - Verify AuthProvider is nested within Providers
   - Verify context value updates in real-time

## Out of Scope

- Email/password authentication implementation (LoginForm/SignupForm integration)
- Protected route middleware or guards
- User profile data from Firestore
- Password reset flows
- Social auth providers (Google, GitHub, etc.)
- Auth error handling UI components
- Loading skeletons for auth-dependent content
- Automatic redirects based on auth state

These features should be implemented separately after this foundation is in place.
