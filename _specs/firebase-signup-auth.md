# Spec for Firebase Signup Authentication

branch: claude/feature/firebase-signup-auth

## Summary

Integrate Firebase Authentication into the signup form to enable user registration. Upon successful signup, generate a unique, randomly-generated codename (displayName) by combining three words from different word sets in PascalCase format. Store user profile data in a Firestore 'users' collection.

## Functional requirements

- Hook the SignupForm component to Firebase Auth using `createUserWithEmailAndPassword`
- Generate a random codename by:
  - Selecting one random word from each of three distinct word sets (adjectives, nouns, verbs or similar categories)
  - Concatenating them in PascalCase format (e.g., "SilentFoxRuns")
- Set the generated codename as the user's `displayName` using Firebase Auth's `updateProfile`
- Create a document in the Firestore 'users' collection with:
  - Document ID: user's Firebase UID
  - Fields: `codename` (the displayName) and `id` (the UID)
  - Do NOT store the user's email in the document
- Handle loading states during signup process
- Display appropriate error messages for failed signup attempts
- Redirect user to the dashboard (`/heists`) upon successful signup
- Use only Firebase Web SDK v9+ modular imports

## Possible edge cases

- Email already in use - display Firebase error message
- Weak password - display Firebase error message
- Network failure during signup - handle gracefully
- Firestore document creation fails after successful auth - handle cleanup or retry
- Codename collision (unlikely but possible) - rely on UID as document ID to ensure uniqueness
- User closes browser during signup - Firebase handles auth state persistence

## Acceptance Criteria

- User can successfully sign up with email and password
- Upon signup, user receives a unique codename visible in their profile
- User document is created in Firestore 'users' collection with codename and id
- User is automatically logged in and redirected to `/heists` after successful signup
- Error messages are displayed for invalid credentials or network issues
- Loading state is shown during the signup process
- Email is NOT stored in the Firestore user document

## Open Questions

- Should we validate that the generated codename doesn't contain inappropriate word combinations? Yes, we should implement a basic filter to prevent offensive combinations, but rely on the randomness and large word sets to minimize this risk.
- Should we enforce minimum password requirements beyond Firebase defaults? We can rely on Firebase's built-in password strength checks for now, but may want to add custom validation in the future.
- What should happen if Firestore write fails - should we delete the created auth user? We should attempt to delete the auth user if Firestore document creation fails to avoid orphaned accounts, but also log this error for monitoring.

## Testing Guidelines

Create a test file(s) in the ./tests folder for the new feature, and create meaningful tests for the following cases, without going too heavy:

- Codename generation produces valid PascalCase format from three word sets
- Each word set contains unique, appropriate words
- Generated codenames are different across multiple invocations (randomness check)
- SignupForm displays loading state during submission
- SignupForm displays error message on authentication failure
- Form validation prevents submission with empty fields
