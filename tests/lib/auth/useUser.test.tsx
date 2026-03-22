import { renderHook } from "@testing-library/react"
import { AuthProvider } from "@/lib/auth/AuthContext"
import { useUser } from "@/lib/auth/useUser"

vi.mock("firebase/auth", () => ({
  onAuthStateChanged: vi.fn(() => vi.fn()),
}))

vi.mock("@/lib/firebase", () => ({
  auth: {},
  db: {},
}))

describe("useUser", () => {
  it("throws when used outside AuthProvider", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {})

    expect(() => {
      renderHook(() => useUser())
    }).toThrow("useUser must be used within an AuthProvider")

    consoleSpy.mockRestore()
  })

  it("returns context value when used inside AuthProvider", () => {
    const { result } = renderHook(() => useUser(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    })

    expect(result.current).toHaveProperty("user")
    expect(result.current).toHaveProperty("loading")
  })
})
