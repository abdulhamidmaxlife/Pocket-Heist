# Implementation Plan: Route Protection

## Overview
Implement authentication-based route protection for the application by adding redirect logic to the `(public)` and `(dashboard)` route group layouts. Unauthenticated users will be redirected to `/login` when accessing dashboard routes, while authenticated users will be redirected to `/heists` when accessing public routes (except `/preview`). Both layouts will display a loading indicator while Firebase determines auth state.

## Spec Reference
- Link to the feature spec in `_specs/route-protection.md` for detailed requirements and design references.

## Architectural Considerations

This feature modifies the route group layouts to act as route guards. The key architectural decisions:

1. **Client-side protection**: Both layouts must become client components to use hooks (`useUser`, `useRouter`, `usePathname`)
2. **Loading states**: Show simple centered loading indicator during `loading === true` from `useUser()`
3. **No flash of content**: Children are only rendered when auth state is determined AND user has correct permissions
4. **Next.js navigation**: Use `useRouter().push()` for redirects (client-side navigation)
5. **No nested layouts**: Top-level route group layouts handle all protection logic

### File Structure

Modified files:
```
app/(public)/layout.tsx         # Add auth check and redirect logic
app/(dashboard)/layout.tsx      # Add auth check and redirect logic
tests/app/(public)/layout.test.tsx     # New: Test public layout protection
tests/app/(dashboard)/layout.test.tsx  # New: Test dashboard layout protection
```

No new components needed - layouts handle their own loading states inline.

## Implementation Steps

### 1. Update Public Layout (`app/(public)/layout.tsx`)

Convert to client component with auth protection:

```tsx
"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useUser } from "@/lib/auth"
import Footer from "@/components/Footer"

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { user, loading } = useUser()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Only redirect after auth state is determined
    if (!loading && user && pathname !== "/preview") {
      router.push("/heists")
    }
  }, [user, loading, router, pathname])

  // Show loading state while determining auth
  if (loading) {
    return (
      <main className="public center-content">
        <div>Loading...</div>
      </main>
    )
  }

  // If authenticated (and not on /preview), don't render content
  // The redirect will happen via useEffect
  if (user && pathname !== "/preview") {
    return null
  }

  // Render normally for unauthenticated users
  return (
    <main className="public">
      {children}
      <Footer />
    </main>
  )
}
```

**Key implementation details:**
- `"use client"` directive required for hooks
- Import `useRouter` and `usePathname` from `next/navigation` (App Router)
- Import `useUser` from `@/lib/auth`
- Check `pathname !== "/preview"` to allow preview page for all users
- Redirect in `useEffect` with dependency array `[user, loading, router, pathname]`
- Only redirect when `!loading && user` (auth state determined and user exists)
- Return `null` during redirect to prevent flash of content
- Loading state uses existing `.center-content` utility class from `globals.css`

### 2. Update Dashboard Layout (`app/(dashboard)/layout.tsx`)

Convert to client component with auth protection:

```tsx
"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/lib/auth"
import Navbar from "@/components/Navbar"

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { user, loading } = useUser()
  const router = useRouter()

  useEffect(() => {
    // Only redirect after auth state is determined
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  // Show loading state while determining auth
  if (loading) {
    return (
      <main className="center-content">
        <div>Loading...</div>
      </main>
    )
  }

  // If not authenticated, don't render content
  // The redirect will happen via useEffect
  if (!user) {
    return null
  }

  // Render normally for authenticated users
  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  )
}
```

**Key implementation details:**
- `"use client"` directive required for hooks
- Import `useRouter` from `next/navigation`
- Import `useUser` from `@/lib/auth`
- No `pathname` check needed (all dashboard routes require auth)
- Redirect in `useEffect` with dependency array `[user, loading, router]`
- Only redirect when `!loading && !user` (auth state determined and no user)
- Return `null` during redirect to prevent flash of content
- Loading state uses existing `.center-content` utility class

### 3. Create Public Layout Tests (`tests/app/(public)/layout.test.tsx`)

```tsx
import { render, screen, waitFor } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { useRouter, usePathname } from "next/navigation"
import PublicLayout from "@/app/(public)/layout"
import { useUser } from "@/lib/auth"

// Mock dependencies
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
  usePathname: vi.fn(),
}))

vi.mock("@/lib/auth", () => ({
  useUser: vi.fn(),
}))

vi.mock("@/components/Footer", () => ({
  default: () => <div data-testid="footer">Footer</div>,
}))

describe("PublicLayout", () => {
  const mockPush = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useRouter).mockReturnValue({ push: mockPush } as any)
  })

  it("renders loading state when auth is loading", () => {
    vi.mocked(useUser).mockReturnValue({ user: null, loading: true })
    vi.mocked(usePathname).mockReturnValue("/login")

    render(
      <PublicLayout>
        <div>Child content</div>
      </PublicLayout>
    )

    expect(screen.getByText("Loading...")).toBeInTheDocument()
    expect(screen.queryByText("Child content")).not.toBeInTheDocument()
    expect(screen.queryByTestId("footer")).not.toBeInTheDocument()
  })

  it("renders children and footer when user is null and not loading", () => {
    vi.mocked(useUser).mockReturnValue({ user: null, loading: false })
    vi.mocked(usePathname).mockReturnValue("/login")

    render(
      <PublicLayout>
        <div>Child content</div>
      </PublicLayout>
    )

    expect(screen.getByText("Child content")).toBeInTheDocument()
    expect(screen.getByTestId("footer")).toBeInTheDocument()
    expect(mockPush).not.toHaveBeenCalled()
  })

  it("redirects to /heists when user is authenticated and not loading", async () => {
    vi.mocked(useUser).mockReturnValue({
      user: { uid: "123", email: "test@test.com" } as any,
      loading: false,
    })
    vi.mocked(usePathname).mockReturnValue("/login")

    render(
      <PublicLayout>
        <div>Child content</div>
      </PublicLayout>
    )

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/heists")
    })

    // Should not render children during redirect
    expect(screen.queryByText("Child content")).not.toBeInTheDocument()
    expect(screen.queryByTestId("footer")).not.toBeInTheDocument()
  })

  it("does not redirect when on /preview page even if authenticated", () => {
    vi.mocked(useUser).mockReturnValue({
      user: { uid: "123", email: "test@test.com" } as any,
      loading: false,
    })
    vi.mocked(usePathname).mockReturnValue("/preview")

    render(
      <PublicLayout>
        <div>Preview content</div>
      </PublicLayout>
    )

    expect(mockPush).not.toHaveBeenCalled()
    expect(screen.getByText("Preview content")).toBeInTheDocument()
    expect(screen.getByTestId("footer")).toBeInTheDocument()
  })

  it("does not redirect while auth is still loading", () => {
    vi.mocked(useUser).mockReturnValue({
      user: { uid: "123", email: "test@test.com" } as any,
      loading: true,
    })
    vi.mocked(usePathname).mockReturnValue("/login")

    render(
      <PublicLayout>
        <div>Child content</div>
      </PublicLayout>
    )

    expect(mockPush).not.toHaveBeenCalled()
    expect(screen.getByText("Loading...")).toBeInTheDocument()
  })
})
```

**Test coverage:**
- ✅ Loading state renders when `loading === true`
- ✅ Children and footer render when `user === null && loading === false`
- ✅ Redirects to `/heists` when authenticated (not loading)
- ✅ No redirect on `/preview` page even when authenticated
- ✅ No redirect while auth is loading

### 4. Create Dashboard Layout Tests (`tests/app/(dashboard)/layout.test.tsx`)

```tsx
import { render, screen, waitFor } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/app/(dashboard)/layout"
import { useUser } from "@/lib/auth"

// Mock dependencies
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}))

vi.mock("@/lib/auth", () => ({
  useUser: vi.fn(),
}))

vi.mock("@/components/Navbar", () => ({
  default: () => <div data-testid="navbar">Navbar</div>,
}))

describe("DashboardLayout", () => {
  const mockPush = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useRouter).mockReturnValue({ push: mockPush } as any)
  })

  it("renders loading state when auth is loading", () => {
    vi.mocked(useUser).mockReturnValue({ user: null, loading: true })

    render(
      <DashboardLayout>
        <div>Dashboard content</div>
      </DashboardLayout>
    )

    expect(screen.getByText("Loading...")).toBeInTheDocument()
    expect(screen.queryByText("Dashboard content")).not.toBeInTheDocument()
    expect(screen.queryByTestId("navbar")).not.toBeInTheDocument()
  })

  it("renders Navbar and children when user is authenticated and not loading", () => {
    vi.mocked(useUser).mockReturnValue({
      user: { uid: "123", email: "test@test.com" } as any,
      loading: false,
    })

    render(
      <DashboardLayout>
        <div>Dashboard content</div>
      </DashboardLayout>
    )

    expect(screen.getByText("Dashboard content")).toBeInTheDocument()
    expect(screen.getByTestId("navbar")).toBeInTheDocument()
    expect(mockPush).not.toHaveBeenCalled()
  })

  it("redirects to /login when user is null and not loading", async () => {
    vi.mocked(useUser).mockReturnValue({ user: null, loading: false })

    render(
      <DashboardLayout>
        <div>Dashboard content</div>
      </DashboardLayout>
    )

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/login")
    })

    // Should not render children during redirect
    expect(screen.queryByText("Dashboard content")).not.toBeInTheDocument()
    expect(screen.queryByTestId("navbar")).not.toBeInTheDocument()
  })

  it("does not redirect while auth is still loading", () => {
    vi.mocked(useUser).mockReturnValue({ user: null, loading: true })

    render(
      <DashboardLayout>
        <div>Dashboard content</div>
      </DashboardLayout>
    )

    expect(mockPush).not.toHaveBeenCalled()
    expect(screen.getByText("Loading...")).toBeInTheDocument()
  })
})
```

**Test coverage:**
- ✅ Loading state renders when `loading === true`
- ✅ Navbar and children render when `user !== null && loading === false`
- ✅ Redirects to `/login` when unauthenticated (not loading)
- ✅ No redirect while auth is loading

## Testing Plan

Run tests with:
```bash
npm test tests/app/
```

Or run specific layout tests:
```bash
npm test tests/app/(public)/layout.test.tsx
npm test tests/app/(dashboard)/layout.test.tsx
```

**Testing strategy:**
- Mock `useUser` hook to return different auth states
- Mock `useRouter` to verify redirect calls
- Mock `usePathname` for public layout tests
- Verify loading states render correctly
- Verify children only render when appropriate
- Verify redirects happen with correct timing (after loading)
- Use `waitFor` for async redirect effects

## Edge Cases Handled

| Edge Case | Solution |
|-----------|----------|
| User signs in while on `/login` | Public layout's `useEffect` detects `user !== null` and redirects to `/heists` |
| User signs out while on `/heists` | Dashboard layout's `useEffect` detects `user === null` and redirects to `/login` |
| Direct URL access to `/heists` while unauthenticated | Dashboard layout shows loading, then redirects when auth determined |
| Browser back button after redirect | Next.js router handles navigation correctly; layouts re-evaluate auth state |
| Race condition between auth and redirect | Only redirect when `loading === false` prevents premature redirects |
| Flash of wrong content | Return `null` while redirecting prevents content flash |
| `/preview` page accessibility | `pathname !== "/preview"` check allows both auth states to access it |

## Critical Files

| File Path | Purpose |
|-----------|---------|
| `app/(public)/layout.tsx` | Public route protection - redirects authenticated users to dashboard |
| `app/(dashboard)/layout.tsx` | Dashboard route protection - redirects unauthenticated users to login |
| `tests/app/(public)/layout.test.tsx` | Test suite for public layout auth logic |
| `tests/app/(dashboard)/layout.test.tsx` | Test suite for dashboard layout auth logic |
| `lib/auth/useUser.ts` | Hook providing `{ user, loading }` auth state |
| `app/globals.css` | Contains `.center-content` utility for loading states |

## Verification Steps

### Manual Testing:

1. **Unauthenticated user protection:**
   - Start signed out
   - Visit http://localhost:3000/heists directly
   - Should see loading briefly, then redirect to `/login`
   - Verify no flash of dashboard content

2. **Authenticated user protection:**
   - Sign in to the app
   - Visit http://localhost:3000/login directly
   - Should redirect to `/heists`
   - Verify no flash of login form

3. **Preview page access:**
   - While signed in, visit http://localhost:3000/preview
   - Should render preview page (no redirect)
   - Sign out, visit `/preview` again
   - Should still render (no redirect)

4. **Sign out flow:**
   - Sign in and navigate to `/heists`
   - Click logout button in Navbar
   - Should redirect to `/login` after sign out

5. **Sign in flow:**
   - Start on `/login` page
   - Sign in with valid credentials
   - Should redirect to `/heists` dashboard

### Automated Testing:

```bash
# Run all tests
npm test

# Run layout tests specifically
npm test tests/app/

# Watch mode for development
npm test -- --watch tests/app/
```

**Expected test results:**
- All public layout tests pass (5 tests)
- All dashboard layout tests pass (4 tests)
- No console errors or warnings
- Coverage includes loading, redirect, and render states

## Out of Scope

The following features are explicitly out of scope for this implementation:

1. **Redirect with return URL**: Not preserving the intended destination after login (e.g., `/heists/create` → `/login` → `/heists` instead of back to `/heists/create`)
2. **Route-level permissions**: No granular permissions per route (e.g., admin-only routes)
3. **Server-side protection**: Using only client-side route guards (server components use middleware for protection)
4. **Custom loading components**: Using simple text "Loading..." instead of styled spinner/skeleton
5. **Transition animations**: No fade-in/out during redirects
6. **Error states**: No error UI for auth failures (Firebase handles retries)
7. **Protected preview page**: `/preview` remains accessible to all users (as per spec)
