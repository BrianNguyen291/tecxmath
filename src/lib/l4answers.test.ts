import { describe, expect, it } from "vitest"
import { equivalent } from "./expr"

/** Every answer string a lesson ships must survive the real checker. */
describe("lesson 4 answer strings", () => {
  const all = ["-2", "-4", "2", "-3.125", "-8"]
  it("parses each one", () => {
    for (const v of all) expect(equivalent(v, v)).toBe(true)
  })
  it("keeps them distinct", () => {
    expect(equivalent("-2", "-4")).toBe(false)
    expect(equivalent("-2", "-3.125")).toBe(false)
  })
  it("matches the geometry: gap 4 on y = 0.5(x-p)(x-q) has depth -2", () => {
    const depth = (gap: number) => 0.5 * -((gap / 2) ** 2)
    expect(depth(4)).toBe(-2)
    expect(depth(5)).toBe(-3.125)
    expect(depth(8)).toBe(-8)
  })
})
