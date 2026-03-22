import { render, screen, waitFor } from "@testing-library/react"
import { useContext } from "react"
import { onAuthStateChanged } from "firebase/auth"
import { AuthContext, AuthProvider } from "@/lib/auth/AuthContext"

vi.mock("firebase/auth", () => ({
  onAuthStateChanged: vi.fn(),
}))

vi.mock("@/lib/firebase", () => ({
  auth: {},
  db: {},
}))

const mockOnAuthStateChanged = vi.mocked(onAuthStateChanged)

function TestConsumer() {
  const context = useContext(AuthContext)
  return (
    <div>
      <span data-testid="loading">{String(context?.loading)}</span>
      <span data-testid="user">{context?.user?.email ?? "none"}</span>
    </div>
  )
}

describe("AuthProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders children", () => {
    mockOnAuthStateChanged.mockReturnValue(vi.fn())

    render(
      <AuthProvider>
        <div data-testid="child">Hello</div>
      </AuthProvider>
    )

    expect(screen.getByTestId("child")).toHaveTextContent("Hello")
  })

  it("starts with loading true", () => {
    mockOnAuthStateChanged.mockReturnValue(vi.fn())

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    )

    expect(screen.getByTestId("loading")).toHaveTextContent("true")
  })

  it("sets loading to false when auth resolves with null", async () => {
    mockOnAuthStateChanged.mockImplementation((_auth, callback) => {
      if (typeof callback === "function") {
        callback(null)
      }
      return vi.fn()
    })

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false")
    })
    expect(screen.getByTestId("user")).toHaveTextContent("none")
  })

  it("updates user state when onAuthStateChanged fires", async () => {
    const mockUser = { email: "test@example.com" }

    mockOnAuthStateChanged.mockImplementation((_auth, callback) => {
      if (typeof callback === "function") {
        callback(mockUser as Parameters<typeof callback>[0])
      }
      return vi.fn()
    })

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId("user")).toHaveTextContent("test@example.com")
      expect(screen.getByTestId("loading")).toHaveTextContent("false")
    })
  })

  it("cleans up subscription on unmount", () => {
    const unsubscribe = vi.fn()
    mockOnAuthStateChanged.mockReturnValue(unsubscribe)

    const { unmount } = render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    )

    unmount()
    expect(unsubscribe).toHaveBeenCalled()
  })
})
