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
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it("renders the form with email, password, and submit button", () => {
    render(<LoginForm />)
    expect(getEmailInput()).toBeInTheDocument()
    expect(getPasswordInput()).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Login" })).toBeInTheDocument()
  })

  it("shows loading state during submission", async () => {
    const user = userEvent.setup()
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
    const user = userEvent.setup()
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
    const user = userEvent.setup()
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

  it("shows error for invalid credentials", async () => {
    const user = userEvent.setup()
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
    const user = userEvent.setup()
    const { FirebaseError } = await import("firebase/app")
    mockLoginUser.mockRejectedValue(
      new FirebaseError("auth/invalid-email", "Invalid email")
    )

    render(<LoginForm />)
    await user.type(getEmailInput(), "bad@email.com")
    await user.type(getPasswordInput(), "password123")
    await user.click(screen.getByRole("button", { name: "Login" }))

    await screen.findByText("Invalid email address")
  })

  it("shows error for disabled account", async () => {
    const user = userEvent.setup()
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
    const user = userEvent.setup()
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
    const user = userEvent.setup()
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

    await user.type(getEmailInput(), "a")

    expect(errorMessage).not.toBeInTheDocument()
  })

  it("clears error when user types in password field", async () => {
    const user = userEvent.setup()
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

    await user.type(getPasswordInput(), "a")

    expect(errorMessage).not.toBeInTheDocument()
  })

  it("disables form inputs during submission", async () => {
    const user = userEvent.setup()
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
    const user = userEvent.setup()
    mockLoginUser.mockRejectedValue(new Error("Network failure"))

    render(<LoginForm />)
    await user.type(getEmailInput(), "test@example.com")
    await user.type(getPasswordInput(), "password123")
    await user.click(screen.getByRole("button", { name: "Login" }))

    await screen.findByText("An unexpected error occurred. Please try again.")
  })

  it("schedules auto-dismiss of success message after 4 seconds", async () => {
    const setTimeoutSpy = vi.spyOn(globalThis, "setTimeout")
    const user = userEvent.setup()
    mockLoginUser.mockResolvedValue({
      user: { uid: "123" },
      codename: "SilentFoxRuns"
    })

    render(<LoginForm />)
    await user.type(getEmailInput(), "test@example.com")
    await user.type(getPasswordInput(), "password123")
    await user.click(screen.getByRole("button", { name: "Login" }))

    await screen.findByText("Welcome back, SilentFoxRuns!")

    expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 4000)
  })
})
