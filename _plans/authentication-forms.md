# Authentication Forms Implementation Plan (Revised)

## Overview
Implement functional login and signup forms with shared reusable components. Pages remain as **server components**, with all interactivity encapsulated in **client form components**.

## Architecture Change
The key change: **Pages stay as server components**, client-side logic moves into dedicated form components:
- **Server Components**: Login/Signup pages (no "use client")
- **Client Components**: LoginForm, SignupForm (handle all state and interactivity)
- **Presentational Components**: Input, Button (can be server components)

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

### 3. LoginForm Component (Client Component)
**Files**: `components/LoginForm/LoginForm.tsx`, `LoginForm.module.css`, `index.ts`

**Purpose**: Client component handling login form state and interactivity

**Key Code** (`LoginForm.tsx`):
```typescript
"use client"

import { useState } from "react"
import Link from "next/link"
import { Eye, EyeOff } from "lucide-react"
import Input from "@/components/Input"
import Button from "@/components/Button"
import styles from "./LoginForm.module.css"

export default function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    console.log({ email, password })
  }

  const togglePassword = () => setShowPassword(!showPassword)

  return (
    <div className={styles.formContainer}>
      <h2 className="form-title">Log in to Your Account</h2>
      <form className={styles.form} onSubmit={handleSubmit}>
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
        <Button type="submit">Login</Button>
      </form>
      <p className={styles.footerText}>
        <Link href="/signup" className={styles.footerLink}>
          Don't have an account? Sign up
        </Link>
      </p>
    </div>
  )
}
```

**Styling** (`LoginForm.module.css`):
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

### 4. SignupForm Component (Client Component)
**Files**: `components/SignupForm/SignupForm.tsx`, `SignupForm.module.css`, `index.ts`

**Purpose**: Client component handling signup form state and interactivity

**Key Code** (`SignupForm.tsx`):
```typescript
"use client"

import { useState } from "react"
import Link from "next/link"
import { Eye, EyeOff } from "lucide-react"
import Input from "@/components/Input"
import Button from "@/components/Button"
import styles from "./SignupForm.module.css"

export default function SignupForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    console.log({ email, password })
  }

  const togglePassword = () => setShowPassword(!showPassword)

  return (
    <div className={styles.formContainer}>
      <h2 className="form-title">Sign up for an Account</h2>
      <form className={styles.form} onSubmit={handleSubmit}>
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
        <Button type="submit">Sign Up</Button>
      </form>
      <p className={styles.footerText}>
        <Link href="/login" className={styles.footerLink}>
          Already have an account? Login
        </Link>
      </p>
    </div>
  )
}
```

**Styling** (`SignupForm.module.css`):
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

## Pages to Update (Remain as Server Components)

### 5. Login Page (Server Component)
**File**: `app/(public)/login/page.tsx`

**Implementation**:
```typescript
import LoginForm from "@/components/LoginForm"

export default function LoginPage() {
  return (
    <div className="center-content">
      <div className="page-content">
        <LoginForm />
      </div>
    </div>
  )
}
```

### 6. Signup Page (Server Component)
**File**: `app/(public)/signup/page.tsx`

**Implementation**:
```typescript
import SignupForm from "@/components/SignupForm"

export default function SignupPage() {
  return (
    <div className="center-content">
      <div className="page-content">
        <SignupForm />
      </div>
    </div>
  )
}
```

---

## Implementation Sequence

1. Create **Button** component (presentational, no state)
2. Create **Input** component (presentational, accepts icon prop)
3. Create **LoginForm** client component (handles login state/logic)
4. Create **SignupForm** client component (handles signup state/logic)
5. Update **login** page (server component, imports LoginForm)
6. Update **signup** page (server component, imports SignupForm)

---

## Critical Files

**Components (12 new files)**:
- `components/Input/Input.tsx`
- `components/Input/Input.module.css`
- `components/Input/index.ts`
- `components/Button/Button.tsx`
- `components/Button/Button.module.css`
- `components/Button/index.ts`
- `components/LoginForm/LoginForm.tsx`
- `components/LoginForm/LoginForm.module.css`
- `components/LoginForm/index.ts`
- `components/SignupForm/SignupForm.tsx`
- `components/SignupForm/SignupForm.module.css`
- `components/SignupForm/index.ts`

**Pages (2 modified)**:
- `app/(public)/login/page.tsx` (stays server component)
- `app/(public)/signup/page.tsx` (stays server component)

---

## Key Architectural Points

**Server/Client Boundary**:
- **Pages**: Server components (no "use client")
- **Forms**: Client components (LoginForm, SignupForm with "use client")
- **Presentational**: Input/Button can be server components (no state)

**State Management**:
- All state (`email`, `password`, `showPassword`) lives in form client components
- Pages simply import and render the form components
- No state management in pages themselves

**Password Toggle**:
- Handled entirely within LoginForm/SignupForm client components
- Button has `type="button"` to prevent form submission
- Icon switches between Eye and EyeOff based on state

**Form Submission**:
- Each form component handles its own submission
- Logs `{ email, password }` to console
- preventDefault called to avoid page reload

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
7. **Verify server components**:
   - Pages should NOT have "use client" directive
   - Only form components should be client components

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
- ✓ **Pages remain server components**
- ✓ **Client interactivity in form components**
