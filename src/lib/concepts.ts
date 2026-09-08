/**
 * The curriculum's atoms. A lesson teaches several concepts; a concept recurs
 * across lessons and, later, across courses — `sign-reasoning` is quadratic
 * inequalities today and trig equations next term, and it must carry its
 * mastery across.
 *
 * Adding a course adds rows here. It does not add machinery.
 */

export const CONCEPT_IDS = [
  "coeff-shape",
  "complete-square",
  "vertex-form",
  "vertex-read",
  "factor-roots",
  "quadratic-formula",
  "discriminant",
  "sign-reasoning",
  "substitution",
] as const

export type ConceptId = (typeof CONCEPT_IDS)[number]

export type Concept = {
  id: ConceptId
  title: string
  /** Concepts that must be reasonably fresh before this one can be learned. */
  requires: ConceptId[]
  /** Weight in "what next" ranking. Load-bearing ideas outrank curiosities. */
  weight: number
}

const C = (id: ConceptId, title: string, requires: ConceptId[], weight = 1): Concept =>
  ({ id, title, requires, weight })

export const CONCEPTS: Record<ConceptId, Concept> = {
  "coeff-shape": C("coeff-shape", "What a, b and c do to the curve", []),
  "complete-square": C("complete-square", "Completing the square", ["coeff-shape"], 1.3),
  "vertex-form": C("vertex-form", "Vertex form a(x−p)² + q", ["complete-square"]),
  "vertex-read": C("vertex-read", "Reading the turning point off the bracket", ["vertex-form"]),
  "factor-roots": C("factor-roots", "Factors, roots and the zero product", ["coeff-shape"], 1.3),
  "quadratic-formula": C("quadratic-formula", "The quadratic formula and where it comes from",
    ["complete-square", "factor-roots"]),
  discriminant: C("discriminant", "b² − 4ac counts the crossings", ["quadratic-formula"]),
  "sign-reasoning": C("sign-reasoning", "Sign of an expression across regions", ["factor-roots"], 1.2),
  substitution: C("substitution", "Spotting a repeated block and substituting", ["factor-roots"]),
}

export const isConceptId = (v: unknown): v is ConceptId =>
  typeof v === "string" && Object.prototype.hasOwnProperty.call(CONCEPTS, v)

/** Prerequisites, deduplicated and transitively closed. Cycle-safe. */
export function prerequisitesOf(id: ConceptId): ConceptId[] {
  const out: ConceptId[] = []
  const seen = new Set<ConceptId>([id])
  const queue = [...CONCEPTS[id].requires]
  while (queue.length) {
    const next = queue.shift()!
    if (seen.has(next)) continue
    seen.add(next)
    out.push(next)
    queue.push(...CONCEPTS[next].requires)
  }
  return out
}

// ---------------------------------------------------------------- syllabus

/**
 * Which lesson teaches which concepts, in course order. Data only — no React
 * here, so the scheduler and its tests stay pure. `src/lessons/index.ts` reads
 * this for display; adding a course appends entries.
 */
export type SyllabusEntry = {
  course: string
  lesson: string
  teaches: ConceptId[]
}

export const SYLLABUS: SyllabusEntry[] = [
  { course: "quadratics", lesson: "l1", teaches: ["coeff-shape"] },
  { course: "quadratics", lesson: "l2", teaches: ["complete-square", "vertex-form"] },
  { course: "quadratics", lesson: "l3", teaches: ["vertex-form", "vertex-read"] },
  { course: "quadratics", lesson: "l4", teaches: ["factor-roots", "quadratic-formula", "complete-square"] },
  { course: "quadratics", lesson: "l5", teaches: ["discriminant", "quadratic-formula"] },
  { course: "quadratics", lesson: "l6", teaches: ["sign-reasoning", "factor-roots", "discriminant"] },
  { course: "quadratics", lesson: "l7", teaches: ["substitution", "factor-roots", "complete-square"] },
]

export const teachesOf = (lesson: string): ConceptId[] =>
  SYLLABUS.find((s) => s.lesson === lesson)?.teaches ?? []

/** The lesson that introduces a concept — where a review sends the student. */
export const anchorLesson = (id: ConceptId): string | undefined =>
  SYLLABUS.find((s) => s.teaches[0] === id)?.lesson ??
  SYLLABUS.find((s) => s.teaches.includes(id))?.lesson
