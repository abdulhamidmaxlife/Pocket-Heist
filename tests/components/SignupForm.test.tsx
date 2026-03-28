import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { vi } from "vitest"
import SignupForm from "@/components/SignupForm"

vi.mock("firebase/auth", () => ({
  onAuthStateChanged: vi.fn(),
}))

vi.mock("@/lib/firebase", () => ({
  auth: {},
  db: {},
}))

const mockPush = vi.fn()
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}))

const mockSignupUser = vi.fn()
vi.mock("@/lib/auth/signup", () => ({
  signupUser: (...args: unknown[]) => mockSignupUser(...args),
}))

function getEmailInput() {
  return screen.getByRole("textbox")
}

function getPasswordInput() {
  return document.querySelector('input[type="password"]') as HTMLInputElement
}

describe("SignupForm", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders the form with email, password, and submit button", () => {
    render(<SignupForm />)
    expect(getEmailInput()).toBeInTheDocument()
    expect(getPasswordInput()).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Sign Up" })).toBeInTheDocument()
  })

  it("shows loading state during submission", async () => {
    const user = userEvent.setup()
    let resolveSignup: () => void
    mockSignupUser.mockReturnValue(
      new Promise<void>((resolve) => { resolveSignup = resolve })
    )

    render(<SignupForm />)
    await user.type(getEmailInput(), "test@example.com")
    await user.type(getPasswordInput(), "password123")
    await user.click(screen.getByRole("button", { name: "Sign Up" }))

    expect(screen.getByRole("button", { name: "Creating Account..." })).toBeDisabled()

    resolveSignup!()
  })

  it("redirects to /heists on successful signup", async () => {
    const user = userEvent.setup()
    mockSignupUser.mockResolvedValue({ user: {}, codename: "SilentFoxRuns" })

    render(<SignupForm />)
    await user.type(getEmailInput(), "test@example.com")
    await user.type(getPasswordInput(), "password123")
    await user.click(screen.getByRole("button", { name: "Sign Up" }))

    await vi.waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/heists")
    })
  })

  it("shows error for email already in use", async () => {
    const user = userEvent.setup()
    const { FirebaseError } = await import("firebase/app")
    mockSignupUser.mockRejectedValue(
      new FirebaseError("auth/email-already-in-use", "Email already in use")
    )

    render(<SignupForm />)
    await user.type(getEmailInput(), "test@example.com")
    await user.type(getPasswordInput(), "password123")
    await user.click(screen.getByRole("button", { name: "Sign Up" }))

    await screen.findByText("An account with this email already exists")
  })

  it("shows error for weak password", async () => {
    const user = userEvent.setup()
    const { FirebaseError } = await import("firebase/app")
    mockSignupUser.mockRejectedValue(
      new FirebaseError("auth/weak-password", "Weak password")
    )

    render(<SignupForm />)
    await user.type(getEmailInput(), "test@example.com")
    await user.type(getPasswordInput(), "123")
    await user.click(screen.getByRole("button", { name: "Sign Up" }))

    await screen.findByText("Password should be at least 6 characters")
  })

  it("shows error for invalid email", async () => {
    const user = userEvent.setup()
    const { FirebaseError } = await import("firebase/app")
    mockSignupUser.mockRejectedValue(
      new FirebaseError("auth/invalid-email", "Invalid email")
    )

    render(<SignupForm />)
    await user.type(getEmailInput(), "bad@email.com")
    await user.type(getPasswordInput(), "password123")
    await user.click(screen.getByRole("button", { name: "Sign Up" }))

    await screen.findByText("Invalid email address")
  })

  it("shows generic error for unexpected errors", async () => {
    const user = userEvent.setup()
    mockSignupUser.mockRejectedValue(new Error("Network failure"))

    render(<SignupForm />)
    await user.type(getEmailInput(), "test@example.com")
    await user.type(getPasswordInput(), "password123")
    await user.click(screen.getByRole("button", { name: "Sign Up" }))

    await screen.findByText("An unexpected error occurred. Please try again.")
  })
})
