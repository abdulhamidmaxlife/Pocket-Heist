import { render, screen, waitFor } from "@testing-library/react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/app/(dashboard)/layout"
import { useUser } from "@/lib/auth"

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}))

vi.mock("@/lib/auth", () => ({
  useUser: vi.fn(),
}))

vi.mock("@/components/Navbar", () => ({
  default: () => <div data-testid="navbar">Navbar</div>,
}))

describe("DashboardLayout", () => {
  const mockPush = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useRouter).mockReturnValue({ push: mockPush } as any)
  })

  it("renders loading state when auth is loading", () => {
    vi.mocked(useUser).mockReturnValue({ user: null, loading: true })

    render(
      <DashboardLayout>
        <div>Dashboard content</div>
      </DashboardLayout>
    )

    expect(screen.getByText("Loading...")).toBeInTheDocument()
    expect(screen.queryByText("Dashboard content")).not.toBeInTheDocument()
    expect(screen.queryByTestId("navbar")).not.toBeInTheDocument()
  })

  it("renders Navbar and children when user is authenticated and not loading", () => {
    vi.mocked(useUser).mockReturnValue({
      user: { uid: "123", email: "test@test.com" } as any,
      loading: false,
    })

    render(
      <DashboardLayout>
        <div>Dashboard content</div>
      </DashboardLayout>
    )

    expect(screen.getByText("Dashboard content")).toBeInTheDocument()
    expect(screen.getByTestId("navbar")).toBeInTheDocument()
    expect(mockPush).not.toHaveBeenCalled()
  })

  it("redirects to /login when user is null and not loading", async () => {
    vi.mocked(useUser).mockReturnValue({ user: null, loading: false })

    render(
      <DashboardLayout>
        <div>Dashboard content</div>
      </DashboardLayout>
    )

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/login")
    })

    expect(screen.queryByText("Dashboard content")).not.toBeInTheDocument()
    expect(screen.queryByTestId("navbar")).not.toBeInTheDocument()
  })

  it("does not redirect while auth is still loading", () => {
    vi.mocked(useUser).mockReturnValue({ user: null, loading: true })

    render(
      <DashboardLayout>
        <div>Dashboard content</div>
      </DashboardLayout>
    )

    expect(mockPush).not.toHaveBeenCalled()
    expect(screen.getByText("Loading...")).toBeInTheDocument()
  })
})
