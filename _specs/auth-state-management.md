# Spec for Auth State Management

branch: claude/feature/auth-state-management

## Summary

Implement a global authentication state management system that provides real-time user status updates across the entire application. This system will expose a `useUser` hook that can be consumed by any page or component to access the current authenticated user (or `null` if logged out). The solution uses React Context with Firebase Auth's `onAuthStateChanged` listener to maintain synchronized user state throughout the app.

## Functional requirements

- Create an `AuthContext` with React Context API to store and provide user state globally
- Implement an `AuthProvider` component that wraps the app at the root level
- Set up Firebase Auth `onAuthStateChanged` listener in the provider to track auth state changes in real-time
- Export a `useUser` hook that returns the current user object (from `firebase.auth().currentUser`) or `null` if logged out
- The user object should include at minimum: `uid`, `email` and `displayName`
- Handle loading state while Firebase initializes and checks authentication status
- Update `app/layout.tsx` to wrap the app with `AuthProvider`
- Update `components/Navbar/Navbar.tsx` to use `useUser` hook for displaying user info
- Update dashboard pages (`app/(dashboard)/heists/page.tsx`, `app/(dashboard)/heists/create/page.tsx`, `app/(dashboard)/heists/[id]/page.tsx`) to access user via `useUser` hook
- Update landing page (`app/(public)/page.tsx`) to access user state for conditional rendering/redirects
- The hook should be callable from both Client and Server Components (with appropriate "use client" directives where needed)

## Possible edge cases

- Firebase Auth not initialized when component mounts (handle with loading state)
- Multiple rapid auth state changes (Firebase handles debouncing internally)
- User object might have incomplete profile data (displayName or email null for new accounts)
- Component unmounting before auth state resolves (ensure cleanup of listener)
- Server-side rendering compatibility (auth state only available client-side)
- Network disconnection causing stale user state (Firebase SDK handles reconnection)

## Acceptance Criteria

- `useUser` hook can be imported and called from any component in the codebase
- Hook returns `null` when user is logged out
- Hook returns a user object with `uid`, `email`, `displayName`, and `photoURL` when logged in
- Auth state updates in real-time across all components when Firebase auth state changes
- Loading state is properly handled (components don't flash or show incorrect state during initialization)
- Navbar displays user information when authenticated
- Dashboard pages can access current user data via the hook
- Landing page can check auth state to determine routing behavior
- No errors in console related to auth state management
- Auth listener is properly cleaned up when components unmount

## Open Questions

- Should we add a `loading` state to the hook return value (e.g., `{ user, loading }`) or handle it separately? Yes, adding a `loading` state would be helpful for components to handle the initialization phase gracefully.
- Should the user object be extended with additional Firebase user properties beyond the minimum required? No, keep it simple for now
- Do we need a separate `isAuthenticated` boolean in the return value, or is `user !== null` sufficient? `user !== null` should be sufficient for most cases, but we can consider adding `isAuthenticated` for clarity if needed in the future.
- Should we implement error handling for Firebase Auth failures in the context provider? Yes, we should at least log errors to the console and consider adding an `error` state to the hook return value for components to handle if needed.

## Testing Guidelines

Create a test file(s) in the ./tests folder for the new feature, and create meaningful tests for the following cases, without going too heavy:

- `useUser` hook returns `null` when no user is authenticated
- `useUser` hook returns user object when user is authenticated
- Auth context provider properly wraps children components
- Multiple components consuming `useUser` receive the same user state
- Loading state is handled correctly during initialization
- Mock Firebase `onAuthStateChanged` to simulate auth state changes
- Test that components re-render when auth state changes
