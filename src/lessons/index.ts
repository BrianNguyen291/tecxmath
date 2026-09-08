import type { ComponentType } from "react"
import type { LessonProps } from "./kit"
import { L1 } from "./l1"
import { L2 } from "./l2"
import { L3 } from "./l3"
import { L4 } from "./l4"
import { L5 } from "./l5"
import { L6 } from "./l6"
import { L7 } from "./l7"

/**
 * `uses` is the evidence this project offers for its own reuse thesis, so it must
 * match the imports. An audit found it inflated in five places; uses.test.ts now
 * asserts it. Note what the corrected table shows: P2, P3 and P5 appear in exactly
 * one lesson each — used once is not the same as demonstrated reusable.
 */
export type LessonMeta = {
  id: string
  title: string
  idea: string
  /** Which primitives this lesson reuses — the reuse thesis, made visible. */
  uses: string[]
  Component: ComponentType<LessonProps>
}

export const LESSONS: LessonMeta[] = [
  { id: "l1", title: "The curve and its coefficients", idea: "What a, b and c each do", uses: ["P1", "P6"], Component: L1 },
  { id: "l2", title: "Completing the square", idea: "The algebra is a literal square", uses: ["P3", "P4", "P6"], Component: L2 },
  { id: "l3", title: "The vertex, read not calculated", idea: "Completed square hands you the turning point", uses: ["P1", "P6"], Component: L3 },
  { id: "l4", title: "Roots, factors and the formula", idea: "Derive the formula, don't memorise it", uses: ["P1", "P2", "P4", "P6"], Component: L4 },
  { id: "l5", title: "The discriminant", idea: "One number counts the crossings", uses: ["P1", "P6"], Component: L5 },
  { id: "l6", title: "Quadratic inequalities", idea: "Solving is reading a sign", uses: ["P1", "P5", "P6"], Component: L6 },
  { id: "l7", title: "Disguised quadratics", idea: "Spot the repeated block", uses: ["P1", "P4", "P6"], Component: L7 },
]

/** The rest of A-level Pure. Same six primitives carry most of it. */
export const COMING = [
  "Graphs and transformations",
  "Differentiation",
  "Integration",
  "Trigonometric equations",
  "Sequences and series",
]
