import { render, screen } from "@testing-library/react"
import Avatar from "@/components/Avatar"

describe("Avatar", () => {
  it("renders successfully", () => {
    render(<Avatar name="Alice" />)
    expect(screen.getByText("A")).toBeInTheDocument()
  })

  it("uses first letter for single-word names", () => {
    render(<Avatar name="bob" />)
    expect(screen.getByText("B")).toBeInTheDocument()
  })

  it("uses first two uppercase letters for PascalCase names", () => {
    render(<Avatar name="PocketHeist" />)
    expect(screen.getByText("PH")).toBeInTheDocument()
  })
})
