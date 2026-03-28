# Spec for Logout Button in Navbar

branch: claude/feature/logout-button-navbar
figma-component: Navbar with logout button

## Summary

Add a logout button to the Navbar component that allows authenticated users to sign out of their session. The button should only be visible when a user is logged in and should trigger Firebase signOut when clicked. No automatic redirects after logout.

## Functional requirements

- Add a logout button to the Navbar component
- Button only renders when `user` is authenticated (not null)
- Button hidden when `user` is null or loading
- Clicking the button calls Firebase `signOut()` from `@/lib/firebase`
- No automatic redirect after logout (user state changes handled by `AuthProvider`)
- Button should be visually distinct and clearly labeled as "Logout" or "Log Out"

## Figma Design Reference

- File: https://www.figma.com/design/elHzuUQZiJXNqJft57oneh/Page-Designs?node-id=57-18&m=dev
- Component Name: Navbar with logout button
- Key Visual Constraints: Design reference could not be automatically retrieved - refer to Figma link manually for visual details
- A screenshot of the relevant design section is included in the @public/Pocket-Heist-Navbar.png file for quick reference.

## Possible edge cases

- User clicks logout while a request is pending
- Multiple rapid clicks on logout button
- Logout fails due to network error or Firebase issue
- User state transitions during logout process

## Acceptance Criteria

- Logout button appears in Navbar only when user is authenticated
- Button is hidden during auth loading state
- Button is hidden when user is not authenticated
- Clicking logout successfully signs user out via Firebase
- User state updates correctly after logout (handled by AuthProvider)
- No errors in console during logout flow
- Button styling matches Figma design reference

## Open Questions

- Should logout button be disabled during logout process? Yes, to prevent multiple clicks and indicate action is in progress.
- Should we show any loading state on the button during signout? Yes, we can show a spinner or change button text to "Logging out..." during the signout process.
- Should we show a confirmation dialog before logout? No, to keep the flow simple and quick for users who want to log out immediately.

## Testing Guidelines

Create a test file in the ./tests folder for the logout functionality with meaningful tests for the following cases:

- Logout button renders when user is authenticated
- Logout button does not render when user is null
- Logout button does not render during loading state
- Clicking logout button calls Firebase signOut
- Button has appropriate accessibility attributes (aria-label, role)
- Button shows loading state during signout proces