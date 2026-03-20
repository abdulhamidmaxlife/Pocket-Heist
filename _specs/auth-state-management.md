# Spec for auth-state-management

branch: claude/feature/auth-state-management
figma-component (if used): N/A

## Summary

Add a global auth state management solution that listens to Firebase Authentication in real time and exposes the current user via a `useUser` hook. Any page or component in the app can call this hook to access the current user — `null` when logged out, or the Firebase user object when logged in.

## Functional requirements

- A React context (`AuthContext`) wraps the entire app and subscribes to Firebase's `onAuthStateChanged` listener
- The context stores the current user (`User | null`) and a loading flag (`boolean`)
- A `useUser` hook provides access to the context values from any page or component
- The listener is set up once on mount and cleaned up on unmount (no duplicate listeners)
- While the initial auth state is being resolved, `loading` is `true`
- Once resolved, `loading` is `false` regardless of whether the user is logged in or not
- The provider is added high enough in the component tree to be available to both `(public)` and `(dashboard)` route groups
- Any existing pages or components that currently access the user should be updated to use `useUser`

## Figma Design Reference (only if referenced)

N/A

## Possible edge cases

- App loads before Firebase resolves the auth state — `loading` flag prevents premature redirects or UI flashes
- User session expires or is revoked remotely — listener updates state to `null` automatically
- Hook is called outside the provider — should throw a clear error message

## Acceptance Criteria

- `useUser` returns `{ user: null, loading: true }` on initial render before Firebase resolves
- `useUser` returns `{ user: User, loading: false }` when a user is logged in
- `useUser` returns `{ user: null, loading: false }` when no user is authenticated
- The auth listener is registered only once and cleaned up when the provider unmounts
- All existing pages/components that access the user are updated to use `useUser`
- Calling `useUser` outside the provider throws a descriptive error

## Open Questions

- Should the `loading` state be exposed from the hook, or handled internally within the provider and protected routes? Exposing it from the hook

## Testing Guidelines

Create a test file(s) in the ./tests folder for the new feature, and create meaningful tests for the following cases, without going too heavy:

- `useUser` returns `null` user and `loading: true` before auth resolves
- `useUser` returns the user object and `loading: false` when authenticated
- `useUser` returns `null` user and `loading: false` when not authenticated
- Calling `useUser` outside the `AuthProvider` throws an error
