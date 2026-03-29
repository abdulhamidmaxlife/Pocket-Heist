# Spec for Route Protection

branch: claude/feature/route-protection

## Summary

Implement route protection to control access to different page groups based on authentication status. The `(public)` route group should be accessible to unauthenticated users and redirect authenticated users to the dashboard. The `(dashboard)` route group should only be accessible to authenticated users and redirect unauthenticated users to the login page. During the authentication state determination, both layouts should display a loading indicator.

## Functional requirements

- Unauthenticated users can access pages in the `(public)` route group (/, /login, /signup, /preview)
- Authenticated users are redirected from `(public)` pages to `/heists` (dashboard home)
- Authenticated users can access pages in the `(dashboard)` route group (/heists, /heists/create, /heists/[id])
- Unauthenticated users are redirected from `(dashboard)` pages to `/login`
- Both route group layouts display a loading indicator while `useUser()` hook's `loading` state is `true`
- Loading indicator should be simple and centered
- Redirects should happen after auth state is determined (when `loading` is `false`)
- Use Next.js `useRouter` and `usePathname` for navigation
- Redirect logic should be implemented in the route group layouts: `app/(public)/layout.tsx` and `app/(dashboard)/layout.tsx`

## Possible edge cases

- User signs in while on a public page — should redirect to dashboard
- User signs out while on a dashboard page — should redirect to login
- Direct URL access to protected routes while unauthenticated
- Browser back/forward navigation after auth state changes
- Race conditions between auth state changes and redirects

## Acceptance Criteria

- Unauthenticated users cannot access dashboard pages (redirected to /login)
- Authenticated users cannot access public pages except preview (redirected to /heists)
- Loading state shows centered indicator until Firebase auth state is resolved
- No flash of wrong content before redirect
- Navigation history works correctly after redirects
- App remains functional after sign in/sign out flows

## Open Questions

- Should the `/preview` page be accessible to both authenticated and unauthenticated users? Preview is only meant for testing. Keep it simple as of now. It can only be accessible to unauthenticated users.
- What should the loading indicator look like (spinner, skeleton, text)? A simple spinner or "Loading..." text centered on the page is sufficient for now.
- Should we preserve the intended destination URL after redirect to login (e.g., return to /heists/123 after signing in)? This is a nice-to-have but can be deferred for a future iteration. For now, just redirect to the dashboard home (/heists) after login.

## Testing Guidelines

Create test file(s) in the ./tests folder for the new feature, and create meaningful tests for the following cases, without going too heavy:

- `(public)/layout.tsx` renders loading state when auth is loading
- `(public)/layout.tsx` renders children when user is null and not loading
- `(public)/layout.tsx` redirects to /heists when user is authenticated
- `(dashboard)/layout.tsx` renders loading state when auth is loading
- `(dashboard)/layout.tsx` renders Navbar and children when user is authenticated
- `(dashboard)/layout.tsx` redirects to /login when user is null
