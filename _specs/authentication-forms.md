# Authentication Forms

## Overview

Add functional login and signup forms to the `/login` and `/signup` pages. Both forms share a similar structure and allow users to switch between them. On submission, form data is logged to the console.

## Goals

- Implement a reusable form structure shared between login and signup
- Include email and password fields with a toggle to show/hide the password
- Provide a clear way for users to switch between login and signup views
- Log form data to the console on submission (no backend integration yet)

## User Stories

- As a user on `/login`, I can enter my email and password and submit the form to log my credentials to the console
- As a user on `/signup`, I can enter my email and password and submit the form to log my credentials to the console
- As a user, I can toggle password visibility using a hide/show icon button
- As a user on `/login`, I can navigate to `/signup` via a link, and vice versa

## Functional Requirements

### Login Page (`/login`)
- Email input field (type: email)
- Password input field with show/hide toggle icon
- Submit button labeled "Login"
- Link to `/signup` ("Don't have an account? Sign up")
- On submit: log `{ email, password }` to the console

### Signup Page (`/signup`)
- Email input field (type: email)
- Password input field with show/hide toggle icon
- Submit button labeled "Sign Up"
- Link to `/login` ("Already have an account? Login")
- On submit: log `{ email, password }` to the console

### Shared Behavior
- Password visibility toggle: clicking the icon switches between `type="password"` and `type="text"`
- Use an eye / eye-off icon (from `lucide-react`) for the toggle
- Forms should be visually consistent with the existing design system

## Non-Goals

- No backend authentication or API calls
- No form validation beyond basic HTML constraints
- No session or token management

## Design Notes

- Follow the existing styling conventions (CSS Modules + Tailwind `@apply`)
- Use the `.form-title` and `.center-content` globals where applicable
- The toggle icon should be positioned inside or adjacent to the password field
- Keep the layout clean and centered, matching the public page style
