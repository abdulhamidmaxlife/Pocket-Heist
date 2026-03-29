import { render, screen, waitFor } from "@testing-library/react"
import { useRouter, usePathname } from "next/navigation"
import PublicLayout from "@/app/(public)/layout"
import { useUser } from "@/lib/auth"

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
  usePathname: vi.fn(),
}))

vi.mock("@/lib/auth", () => ({
  useUser: vi.fn(),
}))

vi.mock("@/components/Footer", () => ({
  default: () => <div data-testid="footer">Footer</div>,
}))

describe("PublicLayout", () => {
  const mockPush = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useRouter).mockReturnValue({ push: mockPush } as any)
  })

  it("renders loading state when auth is loading", () => {
    vi.mocked(useUser).mockReturnValue({ user: null, loading: true })
    vi.mocked(usePathname).mockReturnValue("/login")

    render(
      <PublicLayout>
        <div>Child content</div>
      </PublicLayout>
    )

    expect(screen.getByText("Loading...")).toBeInTheDocument()
    expect(screen.queryByText("Child content")).not.toBeInTheDocument()
    expect(screen.queryByTestId("footer")).not.toBeInTheDocument()
  })

  it("renders children and footer when user is null and not loading", () => {
    vi.mocked(useUser).mockReturnValue({ user: null, loading: false })
    vi.mocked(usePathname).mockReturnValue("/login")

    render(
      <PublicLayout>
        <div>Child content</div>
      </PublicLayout>
    )

    expect(screen.getByText("Child content")).toBeInTheDocument()
    expect(screen.getByTestId("footer")).toBeInTheDocument()
    expect(mockPush).not.toHaveBeenCalled()
  })

  it("redirects to /heists when user is authenticated and not loading", async () => {
    vi.mocked(useUser).mockReturnValue({
      user: { uid: "123", email: "test@test.com" } as any,
      loading: false,
    })
    vi.mocked(usePathname).mockReturnValue("/login")

    render(
      <PublicLayout>
        <div>Child content</div>
      </PublicLayout>
    )

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/heists")
    })

    expect(screen.queryByText("Child content")).not.toBeInTheDocument()
    expect(screen.queryByTestId("footer")).not.toBeInTheDocument()
  })

  it("does not redirect when on /preview page even if authenticated", () => {
    vi.mocked(useUser).mockReturnValue({
      user: { uid: "123", email: "test@test.com" } as any,
      loading: false,
    })
    vi.mocked(usePathname).mockReturnValue("/preview")

    render(
      <PublicLayout>
        <div>Preview content</div>
      </PublicLayout>
    )

    expect(mockPush).not.toHaveBeenCalled()
    expect(screen.getByText("Preview content")).toBeInTheDocument()
    expect(screen.getByTestId("footer")).toBeInTheDocument()
  })

  it("does not redirect while auth is still loading", () => {
    vi.mocked(useUser).mockReturnValue({
      user: { uid: "123", email: "test@test.com" } as any,
      loading: true,
    })
    vi.mocked(usePathname).mockReturnValue("/login")

    render(
      <PublicLayout>
        <div>Child content</div>
      </PublicLayout>
    )

    expect(mockPush).not.toHaveBeenCalled()
    expect(screen.getByText("Loading...")).toBeInTheDocument()
  })
})
