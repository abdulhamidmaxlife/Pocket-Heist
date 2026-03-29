# Spec for login-form-functionality

branch: claude/feature/login-form-functionality

## Summary

Implement login form functionality that allows users to authenticate using Firebase Authentication. The form should accept email and password credentials, validate them against Firebase Auth, and display a success message upon successful login. No redirection is required at this stage.

## Functional requirements

- User can enter email and password in the login form at `/login`
- Form validates that both email and password fields are not empty
- On form submission, authenticate credentials using Firebase Authentication (`signInWithEmailAndPassword`)
- Display a success message when login succeeds
- Display appropriate error messages for failed login attempts (invalid credentials, network errors, etc.)
- Form should handle loading state during authentication
- Form should be disabled during authentication to prevent multiple submissions
- Handle "remember me" functionality via Firebase persistence

## Possible edge cases:

- User enters invalid email format
- User enters incorrect password
- User account doesn't exist
- Network failure during authentication
- Firebase service is down or unreachable
- User rapidly clicks submit button multiple times
- User navigates away during authentication
- Empty form submission attempts

## Acceptance Criteria

- User can successfully log in with valid Firebase credentials
- Success message is displayed after successful authentication
- Error messages are displayed for invalid credentials
- Error messages are displayed for network/Firebase errors
- Form is disabled and shows loading state during authentication
- Form validates required fields before submission
- Multiple rapid submissions are prevented
- Error states are cleared when user modifies input fields

## Open Questions

- What should the success message say? (e.g., "Login successful!" or "Welcome back, [codename]!") User feedback suggests a personalized message with the user's codename would be more engaging.
- Should we persist the success message or auto-dismiss it after a few seconds? User feedback indicates that auto-dismissing the message after 3-5 seconds would be ideal to keep the UI clean while still providing feedback.
- Should we clear the form fields after successful login? Clear the form fields.
- Future: Where should the user be redirected after login? (Dashboard/Heists page) For now, no redirection is needed, but we can plan for this in the future.

## Testing Guidelines

Create a test file(s) in the ./tests folder for the new feature, and create meaningful tests for the following cases, without going too heavy:

- Renders login form with email and password fields
- Displays validation errors for empty fields
- Calls Firebase `signInWithEmailAndPassword` with correct credentials
- Displays success message on successful login
- Displays error message for invalid credentials
- Displays loading state during authentication
- Disables form during submission
- Handles Firebase authentication errors appropriately
