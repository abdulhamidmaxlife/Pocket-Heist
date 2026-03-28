import { generateCodename } from "@/lib/utils/codename"

describe("generateCodename", () => {
  it("returns a PascalCase string", () => {
    const codename = generateCodename()
    expect(codename).toMatch(/^[A-Z][a-z]+[A-Z][a-z]+[A-Z][a-z]+$/)
  })

  it("generates random codenames (>15 unique from 20 calls)", () => {
    const codenames = new Set(
      Array.from({ length: 20 }, () => generateCodename())
    )
    expect(codenames.size).toBeGreaterThan(15)
  })

  it("contains exactly three PascalCase parts", () => {
    const codename = generateCodename()
    const parts = codename.match(/[A-Z][a-z]+/g)
    expect(parts).toHaveLength(3)
  })
})
