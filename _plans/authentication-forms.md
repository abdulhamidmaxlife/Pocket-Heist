# Authentication Forms Implementation Plan

## Overview
Implement functional login and signup forms with shared reusable components. Forms include email/password fields with password visibility toggle and log credentials to console on submit.

## Architecture
Create 3 reusable components (Input, Button, AuthForm) used by login and signup pages. All follow project conventions: no semicolons, CSS Modules with @apply, barrel exports.

---

## Components to Create

### 1. Input Component
**Files**: `components/Input/Input.tsx`, `Input.module.css`, `index.ts`

**Purpose**: Reusable input with label and optional icon (for password toggle)

**Key Code** (`Input.tsx`):
```typescript
import styles from "./Input.module.css"

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  icon?: React.ReactNode
}

export default function Input({ label, icon, ...props }: InputProps) {
  return (
    <div className={styles.inputWrapper}>
      <label className={styles.label}>{label}</label>
      <div className={styles.inputContainer}>
        <input className={styles.input} {...props} />
        {icon && <div className={styles.iconButton}>{icon}</div>}
      </div>
    </div>
  )
}
```

**Styling** (`Input.module.css`):
```css
@reference "../../app/globals.css";

.inputWrapper {
  @apply mb-4;
}

.label {
  @apply block mb-2 font-semibold;
  color: var(--color-heading);
}

.inputContainer {
  @apply relative;
}

.input {
  @apply w-full px-4 py-3 rounded-lg;
  background-color: var(--color-lighter);
  color: var(--color-body);
  border: 1px solid transparent;
}

.input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.inputContainer:has(.iconButton) .input {
  @apply pr-12;
}

.iconButton {
  @apply absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer;
  color: var(--color-body);
}

.iconButton:hover {
  color: var(--color-heading);
}
```

### 2. Button Component
**Files**: `components/Button/Button.tsx`, `Button.module.css`, `index.ts`

**Purpose**: Reusable button extending global .btn class

**Key Code** (`Button.tsx`):
```typescript
import styles from "./Button.module.css"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
}

export default function Button({ children, ...props }: ButtonProps) {
  return (
    <button className={styles.button} {...props}>
      {children}
    </button>
  )
}
```

**Styling** (`Button.module.css`):
```css
@reference "../../app/globals.css";

.button {
  @apply btn w-full;
}
```

### 3. AuthForm Component
**Files**: `components/AuthForm/AuthForm.tsx`, `AuthForm.module.css`, `index.ts`

**Purpose**: Shared form wrapper for login/signup with consistent layout

**Key Code** (`AuthForm.tsx`):
```typescript
import Link from "next/link"
import Button from "@/components/Button"
import styles from "./AuthForm.module.css"

interface AuthFormProps {
  title: string
  children: React.ReactNode
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  submitLabel: string
  footerLink: { text: string; href: string }
}

export default function AuthForm({
  title,
  children,
  onSubmit,
  submitLabel,
  footerLink,
}: AuthFormProps) {
  return (
    <div className={styles.formContainer}>
      <h2 className="form-title">{title}</h2>
      <form className={styles.form} onSubmit={onSubmit}>
        {children}
        <Button type="submit">{submitLabel}</Button>
      </form>
      <p className={styles.footerText}>
        <Link href={footerLink.href} className={styles.footerLink}>
          {footerLink.text}
        </Link>
      </p>
    </div>
  )
}
```

**Styling** (`AuthForm.module.css`):
```css
@reference "../../app/globals.css";

.formContainer {
  @apply mx-auto p-8 rounded-lg;
  max-width: 440px;
  background-color: var(--color-light);
}

.form {
  @apply flex flex-col mt-6;
}

.footerText {
  @apply text-center mt-6;
  color: var(--color-body);
}

.footerLink {
  color: var(--color-primary);
}

.footerLink:hover {
  @apply opacity-80;
}
```

---

## Pages to Update

### 4. Login Page
**File**: `app/(public)/login/page.tsx`

**Implementation**:
```typescript
"use client"

import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import AuthForm from "@/components/AuthForm"
import Input from "@/components/Input"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    console.log({ email, password })
  }

  const togglePassword = () => setShowPassword(!showPassword)

  return (
    <div className="center-content">
      <div className="page-content">
        <AuthForm
          title="Log in to Your Account"
          onSubmit={handleSubmit}
          submitLabel="Login"
          footerLink={{
            text: "Don't have an account? Sign up",
            href: "/signup",
          }}
        >
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            icon={
              <button
                type="button"
                onClick={togglePassword}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            }
          />
        </AuthForm>
      </div>
    </div>
  )
}
```

### 5. Signup Page
**File**: `app/(public)/signup/page.tsx`

**Implementation**: Nearly identical to login, with changes:
- Title: "Sign up for an Account"
- submitLabel: "Sign Up"
- footerLink: `{ text: "Already have an account? Login", href: "/login" }`

---

## Implementation Sequence

1. Create **Button** component (simplest, no dependencies)
2. Create **Input** component (handles text, email, password inputs)
3. Create **AuthForm** component (consumes Button)
4. Update **login** page (consumes all components)
5. Update **signup** page (mirrors login structure)

---

## Critical Files

**Components (9 new files)**:
- `components/Input/Input.tsx`
- `components/Input/Input.module.css`
- `components/Input/index.ts`
- `components/Button/Button.tsx`
- `components/Button/Button.module.css`
- `components/Button/index.ts`
- `components/AuthForm/AuthForm.tsx`
- `components/AuthForm/AuthForm.module.css`
- `components/AuthForm/index.ts`

**Pages (2 modified)**:
- `app/(public)/login/page.tsx`
- `app/(public)/signup/page.tsx`

---

## Password Toggle Implementation

**State Management**:
```typescript
const [showPassword, setShowPassword] = useState(false)
const togglePassword = () => setShowPassword(!showPassword)
```

**Input Type Toggle**:
```typescript
type={showPassword ? "text" : "password"}
```

**Icon Toggle with Button**:
```typescript
icon={
  <button type="button" onClick={togglePassword} aria-label="Toggle password visibility">
    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
  </button>
}
```

**Note**: Button has `type="button"` to prevent form submission

---

## Form Submission

```typescript
const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault()
  console.log({ email, password })
}
```

Each page manages its own state (email, password) and logs to console on submit per spec.

---

## Verification Steps

1. **Run dev server**: `npm run dev`
2. **Navigate to /login**:
   - Verify form displays with email and password fields
   - Enter test credentials (e.g., test@example.com / password123)
   - Click eye icon to toggle password visibility
   - Submit form and check console for `{ email, password }` object
3. **Click "Sign up" link**:
   - Verify navigation to /signup
   - Verify form displays with same structure but different title/button
4. **Test signup form submission**:
   - Enter credentials and submit
   - Check console for logged object
5. **Click "Login" link**:
   - Verify navigation back to /login
6. **Test accessibility**:
   - Tab through form fields
   - Verify password toggle has proper aria-label

---

## Conventions Checklist

- ✓ No semicolons
- ✓ TypeScript interfaces for props
- ✓ CSS Modules with `@reference "../../app/globals.css"`
- ✓ Minimal tailwind in templates (use @apply)
- ✓ Component structure: `components/Name/` with barrel exports
- ✓ Functional components with hooks
- ✓ `@/*` path alias for imports
- ✓ Icons from lucide-react
