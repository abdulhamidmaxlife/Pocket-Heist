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

    const createLink = screen.getByRole("link", { name: /create new heist/i })
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
