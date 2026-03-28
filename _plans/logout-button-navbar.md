# Implementation Plan: Logout Button in Navbar

**Branch:** `claude/feature/logout-button-navbar`
**Spec:** `_specs/logout-button-navbar.md`
**Figma:** [Navbar with logout button](https://www.figma.com/design/elHzuUQZiJXNqJft57oneh/Page-Designs?node-id=57-18&m=dev)
***Screenshot reference:** `@public/Pocket-Heist-Navbar.png`

## Overview

Add a logout button to the Navbar component that:
- Only appears when user is authenticated
- Shows loading state during logout
- Calls Firebase signOut on click
- Matches Figma design (outlined button style)

## Implementation Steps

### 1. Update Navbar Component (`components/Navbar/Navbar.tsx`)

Convert Navbar to a client component and integrate auth state:

```tsx
"use client"

import { Clock8, LogOut, Plus } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useUser } from "@/lib/auth"
import styles from "./Navbar.module.css"

export default function Navbar() {
  const { user, loading } = useUser()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await signOut(auth)
    } catch (error) {
      console.error("Logout failed:", error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <div className={styles.siteNav}>
      <nav>
        <header>
          <h1>
            <Link href="/heists">
              P<Clock8 className={styles.logo} size={14} strokeWidth={2.75} />
              cket Heist
            </Link>
          </h1>
          <div>Tiny missions. Big office mischief.</div>
        </header>
        <ul>
          {user && !loading && (
            <li>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className={styles.btnOutline}
                aria-label="Log out of your account"
              >
                <LogOut size={16} strokeWidth={2.5} />
                {isLoggingOut ? "Logging out..." : "Logout"}
              </button>
            </li>
          )}
          <li>
            <Link href="/heists/create" className="btn">
              <Plus size={16} strokeWidth={2.5} />
              Create Heist
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  )
}
```

**Key changes:**
- Add `"use client"` directive (required for hooks and event handlers)
- Import `useUser` hook to access auth state
- Import `signOut` from `firebase/auth` and `auth` from `@/lib/firebase`
- Import `LogOut` icon from `lucide-react`
- Add `isLoggingOut` state for loading UI
- Conditionally render logout button: `{user && !loading && ...}`
- Button disabled during logout with loading text
- Proper error handling in try/catch
- `aria-label` for accessibility

### 2. Add Button Styles (`components/Navbar/Navbar.module.css`)

Create outlined button style matching Figma design:

```css
@reference "../../app/globals.css";

.siteNav {
  @apply bg-light px-2 py-4;
}

.siteNav nav {
  @apply mx-auto max-w-6xl flex justify-between items-center;
}

.siteNav h1 {
  @apply font-bold text-xl;
}

svg.logo {
  display: inline-block;
}

/* Outlined button for logout */
.btnOutline {
  @apply inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold text-heading border-2 border-lighter transition-all hover:border-primary hover:text-primary;
}

.btnOutline:disabled {
  @apply opacity-50 cursor-not-allowed hover:border-lighter hover:text-heading;
}
```

**Styling details:**
- Uses outlined style (border, no background) vs gradient `.btn`
- Border color: `lighter` (matches design system)
- Hover: border changes to `primary` color
- Disabled state: reduced opacity, prevents hover effects
- Consistent spacing/sizing with `.btn` class

### 3. Update Tests (`tests/components/Navbar.test.tsx`)

Add comprehensive tests for logout functionality:

```tsx
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { signOut } from "firebase/auth"
import Navbar from "@/components/Navbar"
import { useUser } from "@/lib/auth"

// Mock dependencies
vi.mock("firebase/auth", () => ({
  signOut: vi.fn(),
}))

vi.mock("@/lib/firebase", () => ({
  auth: {},
  db: {},
}))

vi.mock("@/lib/auth", () => ({
  useUser: vi.fn(),
}))

describe("Navbar", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders the main heading", () => {
    vi.mocked(useUser).mockReturnValue({ user: null, loading: false })
    render(<Navbar />)

    const heading = screen.getByRole("heading", { level: 1 })
    expect(heading).toBeInTheDocument()
  })

  it("renders the Create Heist link", () => {
    vi.mocked(useUser).mockReturnValue({ user: null, loading: false })
    render(<Navbar />)

    const createLink = screen.getByRole("link", { name: /create heist/i })
    expect(createLink).toBeInTheDocument()
    expect(createLink).toHaveAttribute("href", "/heists/create")
  })

  describe("Logout Button", () => {
    it("renders logout button when user is authenticated", () => {
      vi.mocked(useUser).mockReturnValue({
        user: { uid: "123", email: "test@test.com" } as any,
        loading: false
      })
      render(<Navbar />)

      const logoutButton = screen.getByRole("button", { name: /log out/i })
      expect(logoutButton).toBeInTheDocument()
      expect(logoutButton).toHaveTextContent("Logout")
    })

    it("does not render logout button when user is null", () => {
      vi.mocked(useUser).mockReturnValue({ user: null, loading: false })
      render(<Navbar />)

      const logoutButton = screen.queryByRole("button", { name: /log out/i })
      expect(logoutButton).not.toBeInTheDocument()
    })

    it("does not render logout button during loading state", () => {
      vi.mocked(useUser).mockReturnValue({
        user: { uid: "123", email: "test@test.com" } as any,
        loading: true
      })
      render(<Navbar />)

      const logoutButton = screen.queryByRole("button", { name: /log out/i })
      expect(logoutButton).not.toBeInTheDocument()
    })

    it("calls signOut when logout button is clicked", async () => {
      vi.mocked(useUser).mockReturnValue({
        user: { uid: "123", email: "test@test.com" } as any,
        loading: false
      })
      vi.mocked(signOut).mockResolvedValue()

      render(<Navbar />)
      const logoutButton = screen.getByRole("button", { name: /log out/i })

      await userEvent.click(logoutButton)

      expect(signOut).toHaveBeenCalledTimes(1)
    })

    it("shows loading state during logout", async () => {
      vi.mocked(useUser).mockReturnValue({
        user: { uid: "123", email: "test@test.com" } as any,
        loading: false
      })

      let resolveSignOut: () => void
      vi.mocked(signOut).mockReturnValue(
        new Promise((resolve) => { resolveSignOut = resolve as any })
      )

      render(<Navbar />)
      const logoutButton = screen.getByRole("button", { name: /log out/i })

      await userEvent.click(logoutButton)

      // Check button is disabled and shows loading text
      expect(logoutButton).toBeDisabled()
      expect(logoutButton).toHaveTextContent("Logging out...")

      // Resolve the sign out
      resolveSignOut!()

      await waitFor(() => {
        expect(logoutButton).not.toBeDisabled()
        expect(logoutButton).toHaveTextContent("Logout")
      })
    })

    it("handles logout errors gracefully", async () => {
      vi.mocked(useUser).mockReturnValue({
        user: { uid: "123", email: "test@test.com" } as any,
        loading: false
      })

      const consoleError = vi.spyOn(console, "error").mockImplementation(() => {})
      const error = new Error("Network error")
      vi.mocked(signOut).mockRejectedValue(error)

      render(<Navbar />)
      const logoutButton = screen.getByRole("button", { name: /log out/i })

      await userEvent.click(logoutButton)

      await waitFor(() => {
        expect(consoleError).toHaveBeenCalledWith("Logout failed:", error)
        expect(logoutButton).not.toBeDisabled()
      })

      consoleError.mockRestore()
    })

    it("has proper accessibility attributes", () => {
      vi.mocked(useUser).mockReturnValue({
        user: { uid: "123", email: "test@test.com" } as any,
        loading: false
      })
      render(<Navbar />)

      const logoutButton = screen.getByRole("button", { name: /log out/i })
      expect(logoutButton).toHaveAttribute("aria-label", "Log out of your account")
    })
  })
})
```

**Test coverage:**
- ✅ Logout button renders when authenticated
- ✅ Button hidden when user is null
- ✅ Button hidden during auth loading
- ✅ signOut called on click
- ✅ Loading state shown during logout
- ✅ Error handling tested
- ✅ Accessibility attributes verified
- ✅ Disabled state during logout

## Edge Cases Handled

1. **Multiple rapid clicks**: Button disabled during `isLoggingOut` state
2. **Network errors**: Caught in try/catch, logged to console, button re-enabled
3. **User state transitions**: AuthProvider handles state updates via `onAuthStateChanged`
4. **Pending requests**: Button disabled prevents new logout calls

## Dependencies

**New imports needed:**
- `firebase/auth` - `signOut` function
- `lucide-react` - `LogOut` icon
- `react` - `useState` hook
- `@/lib/auth` - `useUser` hook
- `@/lib/firebase` - `auth` instance

**Test dependencies:**
- `@testing-library/user-event` - for simulating clicks

## Acceptance Criteria Checklist

- ✅ Logout button appears in Navbar only when user is authenticated
- ✅ Button hidden during auth loading state
- ✅ Button hidden when user is not authenticated
- ✅ Clicking logout calls Firebase signOut
- ✅ User state updates handled by AuthProvider (no manual redirects)
- ✅ Error handling prevents console errors
- ✅ Button styling matches Figma (outlined style)
- ✅ Shows loading state during logout
- ✅ Button disabled during logout process
- ✅ Comprehensive test coverage

## Notes

- **No redirect logic needed** - AuthProvider's `onAuthStateChanged` automatically updates user state to null, triggering re-renders
- **Client component required** - Navbar must be "use client" for hooks and event handlers
- **Outlined button style** - Matches Figma design reference, distinct from gradient `.btn`
- **Icon consistency** - Uses lucide-react LogOut icon matching existing Plus icon pattern
- **Error handling** - Logs to console but doesn't show user-facing error (keep logout simple)
