import { describe, expect, it } from "vitest"
import { compile, equivalent } from "./expr"

describe("equivalent", () => {
  it("matches expanded and factored forms", () => {
    expect(equivalent("2(x+3)", "2x+6")).toBe(true)
    expect(equivalent("(x+1)(x-1)", "x^2-1")).toBe(true)
    expect(equivalent("(x+2)^2", "x^2+4x+4")).toBe(true)
  })

  it("matches completed-square and standard form", () => {
    expect(equivalent("(x-3)^2-4", "x^2-6x+5")).toBe(true)
  })

  it("ignores term order and spacing", () => {
    expect(equivalent("6 + 2x", "2x+6")).toBe(true)
  })

  it("accepts implicit multiplication", () => {
    expect(equivalent("3x(x+1)", "3x^2+3x")).toBe(true)
  })

  it("rejects genuinely different expressions", () => {
    expect(equivalent("2x+6", "2x+5")).toBe(false)
    expect(equivalent("(x+1)^2", "x^2+1")).toBe(false)
    expect(equivalent("x^2", "x^3")).toBe(false)
  })

  it("treats -x^2 as -(x^2), not (-x)^2", () => {
    expect(equivalent("-x^2", "0-x*x")).toBe(true)
    expect(equivalent("-x^2", "x^2")).toBe(false)
  })

  it("rejects unparseable input rather than throwing", () => {
    expect(equivalent("2x+", "2x")).toBe(false)
    expect(equivalent("&&&", "1")).toBe(false)
  })

  it("reports a readable error for bad input", () => {
    expect(() => compile("2x+")).toThrow(/Unexpected end/)
    expect(() => compile("")).toThrow(/Nothing entered/)
    expect(() => compile("2 @ 3")).toThrow(/Unexpected character/)
  })

  it("handles functions and constants", () => {
    expect(equivalent("sqrt(x^2)", "abs(x)")).toBe(true)
  })
})
