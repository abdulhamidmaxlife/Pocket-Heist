# Implementation Plan: Login Form Functionality

## Overview
Implement login form functionality using Firebase Authentication to allow users to sign in with their email and password credentials. Display a personalized success message with the user's codename, then auto-dismiss after 3-5 seconds. No redirection is required at this stage.

## Spec Reference
- Link to spec: `_specs/login-form-functionality.md`
- Branch: `claude/feature/login-form-functionality`

## Architectural Considerations

### Firebase Integration Strategy

**Three-step login flow:**
1. Authenticate user with `signInWithEmailAndPassword` from Firebase Auth
2. Fetch user's codename from Firestore `users` collection
3. Display personalized success message with auto-dismiss

**Error Handling:**
- Map Firebase error codes to user-friendly messages
- Display errors inline within the form
- Clear errors when user modifies input fields

**State Management:**
- Component-level state for loading/error/success (no global state needed)
- Auth context automatically picks up authenticated user via `onAuthStateChanged`
- Success message auto-dismisses after 4 seconds (middle of 3-5 second range)
- Form fields cleared after successful login

### File Structure

**New files:**
```
lib/
  auth/
    login.ts                 # Login orchestration function
tests/
  components/
    LoginForm.test.tsx       # LoginForm integration tests
```

**Modified files:**
```
lib/auth/index.ts            # Add loginUser export
components/LoginForm/
  LoginForm.tsx              # Add Firebase integration
  LoginForm.module.css       # Add error and success message styling
```

### Response Object Shape

Login function return type:
```typescript
export interface LoginResult {
  user: User                 // Firebase User object
  codename: string           // User's codename from Firestore
}
```

## Implementation Steps

### 1. Create Login Orchestration Function

Create `lib/auth/login.ts`:

```typescript
import { signInWithEmailAndPassword, User } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"

export interface LoginResult {
  user: User
  codename: string
}

export async function loginUser(
  email: string,
  password: string
): Promise<LoginResult> {
  // Step 1: Authenticate with Firebase
  const userCredential = await signInWithEmailAndPassword(auth, email, password)
  const user = userCredential.user

  // Step 2: Fetch codename from Firestore
  const userDoc = await getDoc(doc(db, "users", user.uid))

  if (!userDoc.exists()) {
    throw new Error("User profile not found")
  }

  const { codename } = userDoc.data()

  return { user, codename }
}
```

Update `lib/auth/index.ts`:
```typescript
export { loginUser } from "./login"
export type { LoginResult } from "./login"
```

### 2. Update LoginForm Component

Modify `components/LoginForm/LoginForm.tsx`:

**Add imports:**
```typescript
import { FirebaseError } from "firebase/app"
import { loginUser } from "@/lib/auth"
```

**Add state:**
```typescript
const [loading, setLoading] = useState(false)
const [error, setError] = useState("")
const [success, setSuccess] = useState("")
```

**Update handleSubmit:**
```typescript
const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault()
  setError("")
  setSuccess("")
  setLoading(true)

  try {
    const { codename } = await loginUser(email, password)

    // Show success message
    setSuccess(`Welcome back, ${codename}!`)

    // Clear form fields
    setEmail("")
    setPassword("")

    // Auto-dismiss success message after 4 seconds
    setTimeout(() => {
      setSuccess("")
    }, 4000)

  } catch (err) {
    if (err instanceof FirebaseError) {
      switch (err.code) {
        case "auth/invalid-credential":
        case "auth/user-not-found":
        case "auth/wrong-password":
          setError("Invalid email or password")
          break
        case "auth/invalid-email":
          setError("Invalid email address")
          break
        case "auth/user-disabled":
          setError("This account has been disabled")
          break
        case "auth/too-many-requests":
          setError("Too many failed attempts. Please try again later.")
          break
        default:
          setError("Failed to log in. Please try again.")
      }
    } else {
      setError("An unexpected error occurred. Please try again.")
    }
  } finally {
    setLoading(false)
  }
}
```

**Clear errors on input change:**
```typescript
// Update existing handlers
const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setEmail(e.target.value)
  if (error) setError("")
}

const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setPassword(e.target.value)
  if (error) setError("")
}
```

**Update JSX:**
```typescript
<form className={styles.form} onSubmit={handleSubmit}>
  {error && <div className={styles.error}>{error}</div>}
  {success && <div className={styles.success}>{success}</div>}
  <Input
    label="Email"
    type="email"
    value={email}
    onChange={handleEmailChange}
    required
    disabled={loading}
  />
  <Input
    label="Password"
    type={showPassword ? "text" : "password"}
    value={password}
    onChange={handlePasswordChange}
    required
    disabled={loading}
    icon={
      <button
        type="button"
        onClick={togglePassword}
        aria-label="Toggle password visibility"
        disabled={loading}
      >
        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
      </button>
    }
  />
  <Button type="submit" disabled={loading}>
    {loading ? "Logging in..." : "Login"}
  </Button>
</form>
```

### 3. Add Message Styling

Add to `components/LoginForm/LoginForm.module.css`:

```css
.error {
  @apply text-[--color-error] text-sm;
  margin-bottom: 1rem;
}

.success {
  @apply text-[--color-success] text-sm;
  margin-bottom: 1rem;
  font-weight: 500;
}
```

### 4. Create Tests

Create `tests/components/LoginForm.test.tsx`:

```typescript
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { vi } from "vitest"
import LoginForm from "@/components/LoginForm"

vi.mock("firebase/auth", () => ({
  onAuthStateChanged: vi.fn(),
}))

vi.mock("@/lib/firebase", () => ({
  auth: {},
  db: {},
}))

const mockLoginUser = vi.fn()
vi.mock("@/lib/auth/login", () => ({
  loginUser: (...args: unknown[]) => mockLoginUser(...args),
}))

function getEmailInput() {
  return screen.getByRole("textbox")
}

function getPasswordInput() {
  return document.querySelector('input[type="password"]') as HTMLInputElement
}

describe("LoginForm", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  it("renders the form with email, password, and submit button", () => {
    render(<LoginForm />)
    expect(getEmailInput()).toBeInTheDocument()
    expect(getPasswordInput()).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Login" })).toBeInTheDocument()
  })

  it("shows loading state during submission", async () => {
    const user = userEvent.setup({ delay: null })
    let resolveLogin: () => void
    mockLoginUser.mockReturnValue(
      new Promise<void>((resolve) => { resolveLogin = resolve })
    )

    render(<LoginForm />)
    await user.type(getEmailInput(), "test@example.com")
    await user.type(getPasswordInput(), "password123")
    await user.click(screen.getByRole("button", { name: "Login" }))

    expect(screen.getByRole("button", { name: "Logging in..." })).toBeDisabled()

    resolveLogin!()
  })

  it("displays success message with codename on successful login", async () => {
    const user = userEvent.setup({ delay: null })
    mockLoginUser.mockResolvedValue({
      user: { uid: "123" },
      codename: "SilentFoxRuns"
    })

    render(<LoginForm />)
    await user.type(getEmailInput(), "test@example.com")
    await user.type(getPasswordInput(), "password123")
    await user.click(screen.getByRole("button", { name: "Login" }))

    await screen.findByText("Welcome back, SilentFoxRuns!")
  })

  it("clears form fields after successful login", async () => {
    const user = userEvent.setup({ delay: null })
    mockLoginUser.mockResolvedValue({
      user: { uid: "123" },
      codename: "SilentFoxRuns"
    })

    render(<LoginForm />)
    const emailInput = getEmailInput()
    const passwordInput = getPasswordInput()

    await user.type(emailInput, "test@example.com")
    await user.type(passwordInput, "password123")
    await user.click(screen.getByRole("button", { name: "Login" }))

    await screen.findByText("Welcome back, SilentFoxRuns!")

    expect(emailInput).toHaveValue("")
    expect(passwordInput).toHaveValue("")
  })

  it("auto-dismisses success message after 4 seconds", async () => {
    const user = userEvent.setup({ delay: null })
    mockLoginUser.mockResolvedValue({
      user: { uid: "123" },
      codename: "SilentFoxRuns"
    })

    render(<LoginForm />)
    await user.type(getEmailInput(), "test@example.com")
    await user.type(getPasswordInput(), "password123")
    await user.click(screen.getByRole("button", { name: "Login" }))

    const successMessage = await screen.findByText("Welcome back, SilentFoxRuns!")
    expect(successMessage).toBeInTheDocument()

    vi.advanceTimersByTime(4000)

    expect(successMessage).not.toBeInTheDocument()
  })

  it("shows error for invalid credentials", async () => {
    const user = userEvent.setup({ delay: null })
    const { FirebaseError } = await import("firebase/app")
    mockLoginUser.mockRejectedValue(
      new FirebaseError("auth/invalid-credential", "Invalid credentials")
    )

    render(<LoginForm />)
    await user.type(getEmailInput(), "test@example.com")
    await user.type(getPasswordInput(), "wrongpassword")
    await user.click(screen.getByRole("button", { name: "Login" }))

    await screen.findByText("Invalid email or password")
  })

  it("shows error for invalid email format", async () => {
    const user = userEvent.setup({ delay: null })
    const { FirebaseError } = await import("firebase/app")
    mockLoginUser.mockRejectedValue(
      new FirebaseError("auth/invalid-email", "Invalid email")
    )

    render(<LoginForm />)
    await user.type(getEmailInput(), "bademail")
    await user.type(getPasswordInput(), "password123")
    await user.click(screen.getByRole("button", { name: "Login" }))

    await screen.findByText("Invalid email address")
  })

  it("shows error for disabled account", async () => {
    const user = userEvent.setup({ delay: null })
    const { FirebaseError } = await import("firebase/app")
    mockLoginUser.mockRejectedValue(
      new FirebaseError("auth/user-disabled", "User disabled")
    )

    render(<LoginForm />)
    await user.type(getEmailInput(), "test@example.com")
    await user.type(getPasswordInput(), "password123")
    await user.click(screen.getByRole("button", { name: "Login" }))

    await screen.findByText("This account has been disabled")
  })

  it("shows error for too many attempts", async () => {
    const user = userEvent.setup({ delay: null })
    const { FirebaseError } = await import("firebase/app")
    mockLoginUser.mockRejectedValue(
      new FirebaseError("auth/too-many-requests", "Too many requests")
    )

    render(<LoginForm />)
    await user.type(getEmailInput(), "test@example.com")
    await user.type(getPasswordInput(), "password123")
    await user.click(screen.getByRole("button", { name: "Login" }))

    await screen.findByText("Too many failed attempts. Please try again later.")
  })

  it("clears error when user types in email field", async () => {
    const user = userEvent.setup({ delay: null })
    const { FirebaseError } = await import("firebase/app")
    mockLoginUser.mockRejectedValue(
      new FirebaseError("auth/invalid-credential", "Invalid credentials")
    )

    render(<LoginForm />)
    await user.type(getEmailInput(), "test@example.com")
    await user.type(getPasswordInput(), "wrongpassword")
    await user.click(screen.getByRole("button", { name: "Login" }))

    const errorMessage = await screen.findByText("Invalid email or password")
    expect(errorMessage).toBeInTheDocument()

    await user.type(getEmailInput(), "new@example.com")

    expect(errorMessage).not.toBeInTheDocument()
  })

  it("clears error when user types in password field", async () => {
    const user = userEvent.setup({ delay: null })
    const { FirebaseError } = await import("firebase/app")
    mockLoginUser.mockRejectedValue(
      new FirebaseError("auth/invalid-credential", "Invalid credentials")
    )

    render(<LoginForm />)
    await user.type(getEmailInput(), "test@example.com")
    await user.type(getPasswordInput(), "wrongpassword")
    await user.click(screen.getByRole("button", { name: "Login" }))

    const errorMessage = await screen.findByText("Invalid email or password")
    expect(errorMessage).toBeInTheDocument()

    await user.type(getPasswordInput(), "newpassword")

    expect(errorMessage).not.toBeInTheDocument()
  })

  it("disables form inputs during submission", async () => {
    const user = userEvent.setup({ delay: null })
    let resolveLogin: () => void
    mockLoginUser.mockReturnValue(
      new Promise<void>((resolve) => { resolveLogin = resolve })
    )

    render(<LoginForm />)
    await user.type(getEmailInput(), "test@example.com")
    await user.type(getPasswordInput(), "password123")
    await user.click(screen.getByRole("button", { name: "Login" }))

    expect(getEmailInput()).toBeDisabled()
    expect(getPasswordInput()).toBeDisabled()
    expect(screen.getByRole("button", { name: "Logging in..." })).toBeDisabled()

    resolveLogin!()
  })

  it("shows generic error for unexpected errors", async () => {
    const user = userEvent.setup({ delay: null })
    mockLoginUser.mockRejectedValue(new Error("Network failure"))

    render(<LoginForm />)
    await user.type(getEmailInput(), "test@example.com")
    await user.type(getPasswordInput(), "password123")
    await user.click(screen.getByRole("button", { name: "Login" }))

    await screen.findByText("An unexpected error occurred. Please try again.")
  })
})
```

## Testing Plan

**Integration tests:**
- `tests/components/LoginForm.test.tsx` - UI states, error handling, success messages, auto-dismiss

**Commands:**
```bash
npm test -- tests/components/LoginForm.test.tsx
npm test  # All tests
```

## Edge Cases Handled

| Edge Case | Solution |
|-----------|----------|
| Invalid credentials | Display "Invalid email or password" (covers wrong-password, user-not-found, invalid-credential) |
| Invalid email format | Display "Invalid email address" |
| User account disabled | Display "This account has been disabled" |
| Too many login attempts | Display "Too many failed attempts. Please try again later." |
| Network failure | Display "Failed to log in. Please try again." |
| User rapidly clicks submit | Form disabled during authentication prevents multiple submissions |
| User navigates away during auth | Firebase handles cleanup automatically |
| Empty form submission | HTML5 `required` attribute prevents submission |
| User profile not found in Firestore | Throw error with message "User profile not found" |
| User modifies input after error | Error message cleared on input change |
| Unknown Firebase errors | Display generic error message |

## Critical Files

| File Path | Purpose |
|-----------|---------|
| `lib/auth/login.ts` | Orchestrates Firebase auth and Firestore fetch |
| `lib/auth/index.ts` | Export loginUser and LoginResult type |
| `components/LoginForm/LoginForm.tsx` | UI integration with states and auto-dismiss |
| `components/LoginForm/LoginForm.module.css` | Error and success message styling |
| `tests/components/LoginForm.test.tsx` | Integration tests for all scenarios |

## Verification Steps

**Automated:**
1. `npm test` - all tests pass
2. `npm test -- tests/components/LoginForm.test.tsx` - focused test run

**Manual:**
1. `npm run dev` → navigate to `/login`
2. Enter valid credentials, click "Login"
3. Verify loading state ("Logging in..." button)
4. Verify success message appears with codename
5. Verify form fields are cleared
6. Wait 4 seconds - verify success message disappears
7. Test error cases:
   - Invalid email format
   - Wrong password
   - Non-existent account
8. Verify error clears when typing in either field
9. Verify form is disabled during submission
10. Check Firebase Console - user should be authenticated

## Out of Scope

- Redirection after login (future enhancement)
- Password reset/recovery
- Email verification
- "Remember me" checkbox UI (Firebase persistence is always enabled)
- Social auth providers
- Multi-factor authentication
- Session timeout handling
- Logout functionality (separate feature)
