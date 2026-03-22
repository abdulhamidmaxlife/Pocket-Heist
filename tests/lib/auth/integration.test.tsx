import { render, screen, act } from "@testing-library/react"
import { onAuthStateChanged, User } from "firebase/auth"
import { AuthProvider } from "@/lib/auth/AuthContext"
import { useUser } from "@/lib/auth/useUser"

vi.mock("firebase/auth", () => ({
  onAuthStateChanged: vi.fn(),
}))

vi.mock("@/lib/firebase", () => ({
  auth: {},
  db: {},
}))

const mockOnAuthStateChanged = vi.mocked(onAuthStateChanged)

function AuthDisplay() {
  const { user, loading } = useUser()

  if (loading) return <div data-testid="status">loading</div>
  if (user) return <div data-testid="status">authenticated:{user.email}</div>
  return <div data-testid="status">unauthenticated</div>
}

describe("Auth integration", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("flows from loading to authenticated", async () => {
    const mockUser = { email: "user@test.com" }
    let authCallback: ((user: User | null) => void) | null = null

    mockOnAuthStateChanged.mockImplementation((_auth, callback) => {
      if (typeof callback === "function") {
        authCallback = callback
      }
      return vi.fn()
    })

    render(
      <AuthProvider>
        <AuthDisplay />
      </AuthProvider>
    )

    expect(screen.getByTestId("status")).toHaveTextContent("loading")

    await act(async () => {
      authCallback?.(mockUser as User)
    })

    expect(screen.getByTestId("status")).toHaveTextContent("authenticated:user@test.com")
  })

  it("flows from loading to unauthenticated", async () => {
    let authCallback: ((user: User | null) => void) | null = null

    mockOnAuthStateChanged.mockImplementation((_auth, callback) => {
      if (typeof callback === "function") {
        authCallback = callback
      }
      return vi.fn()
    })

    render(
      <AuthProvider>
        <AuthDisplay />
      </AuthProvider>
    )

    expect(screen.getByTestId("status")).toHaveTextContent("loading")

    await act(async () => {
      authCallback?.(null)
    })

    expect(screen.getByTestId("status")).toHaveTextContent("unauthenticated")
  })

  it("propagates auth state updates to nested components", async () => {
    const mockUser = { email: "nested@test.com" }
    let authCallback: ((user: User | null) => void) | null = null

    mockOnAuthStateChanged.mockImplementation((_auth, callback) => {
      if (typeof callback === "function") {
        authCallback = callback
      }
      return vi.fn()
    })

    function NestedChild() {
      const { user } = useUser()
      return <span data-testid="nested">{user?.email ?? "no-user"}</span>
    }

    render(
      <AuthProvider>
        <div>
          <AuthDisplay />
          <NestedChild />
        </div>
      </AuthProvider>
    )

    await act(async () => {
      authCallback?.(mockUser as User)
    })

    expect(screen.getByTestId("status")).toHaveTextContent("authenticated:nested@test.com")
    expect(screen.getByTestId("nested")).toHaveTextContent("nested@test.com")
  })
})
