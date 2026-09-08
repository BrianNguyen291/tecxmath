import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import { LESSONS } from "./index"

/**
 * The reuse ledger is the evidence this project offers for its own thesis, and an
 * audit found it overstated in four places. This keeps it honest: a lesson may
 * only claim a primitive it actually imports.
 */
const PRIMITIVE_OF: Record<string, string> = {
  Plot: "P1", Curve: "P1", ParamCurve: "P1", Dot: "P1",
  DragPoint: "P2",
  AreaModel: "P3",
  Steps: "P4",
  SignExplorer: "P5",
  Choice: "P6", Entry: "P6",
}

describe("reuse ledger", () => {
  for (const lesson of LESSONS) {
    it(`${lesson.id} claims only primitives it imports`, () => {
      const src = readFileSync(new URL(`./${lesson.id}.tsx`, import.meta.url), "utf8")
      const actual = new Set<string>()
      for (const [name, p] of Object.entries(PRIMITIVE_OF)) {
        if (new RegExp(`\\b${name}\\b`).test(src)) actual.add(p)
      }
      expect([...lesson.uses].sort()).toEqual([...actual].sort())
    })
  }
})
