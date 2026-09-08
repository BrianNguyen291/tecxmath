import { beforeEach, describe, expect, it } from "vitest"
import {
  applyEvidence, isDue, level, loadMastery, parseMastery, quality, record, resetMastery,
  retention, type ConceptState,
} from "./mastery"
import { nextUp, recommend } from "./next"
import { SYLLABUS } from "./concepts"

const DAY = 86_400_000
const T0 = 1_700_000_000_000
const right = { concept: "discriminant" as const, correct: true, attempt: 1 }

describe("quality", () => {
  it("scores a first-try correct answer at full marks", () => {
    expect(quality(right)).toBe(1)
  })

  it("discounts later attempts and scores a miss at zero", () => {
    expect(quality({ ...right, attempt: 3 })).toBeCloseTo(0.454, 2)
    expect(quality({ ...right, correct: false })).toBe(0)
  })

  it("discounts a slow correct answer but ignores an abandoned tab", () => {
    expect(quality({ ...right, ms: 60_000 })).toBeCloseTo(0.8, 5)
    expect(quality({ ...right, ms: 3 * 3600_000 })).toBe(1)
  })
})

describe("applyEvidence", () => {
  it("gives a new concept a half-life of a day or two", () => {
    const s = applyEvidence(undefined, right, T0)
    expect(s.half).toBeCloseTo(1.6, 5)
    expect(s.reps).toBe(1)
  })

  it("earns almost nothing for answering again immediately", () => {
    const a = applyEvidence(undefined, right, T0)
    const b = applyEvidence(a, right, T0)
    expect(b.half - a.half).toBeLessThan(0.01)
  })

  it("earns a lot for recalling something nearly forgotten", () => {
    const a = applyEvidence(undefined, right, T0)
    const b = applyEvidence(a, right, T0 + 4 * DAY)
    expect(b.half).toBeGreaterThan(a.half * 2)
  })

  it("cuts the half-life on a miss and counts the lapse", () => {
    const a = applyEvidence(undefined, right, T0)
    const b = applyEvidence(a, { ...right, correct: false }, T0 + DAY)
    expect(b.half).toBeCloseTo(a.half * 0.45, 5)
    expect(b.lapses).toBe(1)
  })

  it("lets weak evidence nudge rather than swing", () => {
    const a = applyEvidence(undefined, right, T0)
    const strong = applyEvidence(a, right, T0 + 4 * DAY)
    const weak = applyEvidence(a, { ...right, kind: "steps" }, T0 + 4 * DAY)
    expect(weak.half).toBeGreaterThan(a.half)
    expect(weak.half).toBeLessThan(strong.half)
  })

  it("never leaves the clamp, however much evidence arrives", () => {
    let s: ConceptState | undefined
    for (let i = 0; i < 200; i++) s = applyEvidence(s, right, T0 + i * 30 * DAY)
    expect(s!.half).toBeLessThanOrEqual(180)
    for (let i = 0; i < 200; i++) s = applyEvidence(s, { ...right, correct: false }, T0 + i * DAY)
    expect(s!.half).toBeGreaterThanOrEqual(0.1)
  })

  it("does not mutate the state it is given", () => {
    const a = applyEvidence(undefined, right, T0)
    const copy = { ...a }
    applyEvidence(a, right, T0 + DAY)
    expect(a).toEqual(copy)
  })
})

describe("retention and review", () => {
  it("halves over exactly one half-life", () => {
    const s: ConceptState = { half: 2, seen: T0, reps: 1, lapses: 0 }
    expect(retention(s, T0)).toBe(1)
    expect(retention(s, T0 + 2 * DAY)).toBeCloseTo(0.5, 6)
  })

  it("reports an unseen concept as zero, not NaN", () => {
    expect(retention(undefined, T0)).toBe(0)
    expect(level(undefined, T0)).toBe("unseen")
  })

  it("falls due when retention drops past 0.7", () => {
    const s: ConceptState = { half: 10, seen: T0, reps: 3, lapses: 0 }
    expect(isDue(s, T0 + 4 * DAY)).toBe(false)
    expect(isDue(s, T0 + 6 * DAY)).toBe(true)
  })
})

describe("storage", () => {
  const store = (impl: Partial<Storage>) =>
    Object.defineProperty(globalThis, "localStorage", { value: impl, configurable: true })

  beforeEach(() => resetMastery())

  it("works with no localStorage at all", () => {
    // vitest's node environment has none — this is the private-browsing case.
    expect(() => loadMastery()).not.toThrow()
    const m = record(right, T0)
    expect(m.discriminant).toBeDefined()
    // the session cache still serves recommendations even with nothing persisted
    expect(nextUp(m, T0)).toBeDefined()
  })

  it("never throws when storage throws", () => {
    store({
      getItem: () => { throw new Error("blocked") },
      setItem: () => { throw new Error("quota") },
      removeItem: () => { throw new Error("blocked") },
    })
    resetMastery()
    expect(() => loadMastery()).not.toThrow()
    expect(() => record(right, T0)).not.toThrow()
    expect(() => resetMastery()).not.toThrow()
  })

  it("drops corrupt and unknown rows instead of trusting them", () => {
    const m = parseMastery({
      "not-a-concept": { half: 3, seen: T0 },
      discriminant: { half: "x", seen: T0 },
      "coeff-shape": { half: 1e9, seen: T0, reps: 2, lapses: 0 },
      "vertex-form": null,
    })
    expect(Object.keys(m)).toEqual(["coeff-shape"])
    expect(m["coeff-shape"].half).toBe(180)
  })

  it("treats a non-object store as empty", () => {
    expect(parseMastery(null)).toEqual({})
    expect(parseMastery("nope")).toEqual({})
    expect(parseMastery([1, 2, 3])).toEqual({})
  })

  it("survives outright garbage in the key", () => {
    store({ getItem: () => "]not json[", setItem: () => {}, removeItem: () => {} })
    resetMastery()
    store({ getItem: () => "]not json[", setItem: () => {}, removeItem: () => {} })
    expect(loadMastery()).toEqual({})
  })
})

describe("recommend", () => {
  beforeEach(() => resetMastery())

  it("starts a fresh student at the first lesson", () => {
    const r = nextUp({}, T0)
    expect(r?.kind).toBe("learn")
    expect(r?.lesson).toBe(SYLLABUS[0].lesson)
  })

  it("puts a decayed concept ahead of new material", () => {
    const m = { "coeff-shape": { half: 1, seen: T0 - 5 * DAY, reps: 3, lapses: 0 } }
    const top = nextUp(m, T0)!
    expect(top.kind).toBe("review")
    expect(top.concept).toBe("coeff-shape")
  })

  it("never buries the student in review", () => {
    const stale = { half: 1, seen: T0 - 20 * DAY, reps: 2, lapses: 0 }
    const m = Object.fromEntries(SYLLABUS.flatMap((s) => s.teaches).map((id) => [id, stale]))
    expect(recommend(m, T0).filter((r) => r.kind === "review")).toHaveLength(2)
  })

  it("offers new material alongside a review that does not block it", () => {
    const fresh = { half: 20, seen: T0, reps: 4, lapses: 0 }
    const m = {
      "coeff-shape": fresh, "complete-square": fresh, "vertex-form": fresh,
      "vertex-read": { half: 1, seen: T0 - 5 * DAY, reps: 3, lapses: 0 },
    }
    const out = recommend(m, T0)
    expect(out.find((r) => r.kind === "review")?.concept).toBe("vertex-read")
    expect(out.find((r) => r.kind === "learn")?.lesson).toBe("l4")
  })

  it("blocks new material behind a prerequisite that has faded", () => {
    // coeff-shape underpins everything; at 3% there is nothing to build on.
    const m = { "coeff-shape": { half: 1, seen: T0 - 5 * DAY, reps: 3, lapses: 0 } }
    const out = recommend(m, T0)
    expect(out.every((r) => r.lesson === "l1")).toBe(true)
  })

  it("never sends a decayed concept back as new learning", () => {
    const faded = { half: 1, seen: T0 - 40 * DAY, reps: 2, lapses: 0 }
    const m = Object.fromEntries(SYLLABUS.flatMap((s) => s.teaches).map((id) => [id, faded]))
    expect(recommend(m, T0).some((r) => r.kind === "learn")).toBe(false)
  })

  it("shores up a missing prerequisite before the lesson that needs it", () => {
    // Everything met except the roots concepts — l5 leans on them through the formula.
    const seen = { half: 20, seen: T0, reps: 4, lapses: 0 }
    const m = { "coeff-shape": seen, "complete-square": seen, "vertex-form": seen, "vertex-read": seen }
    const top = recommend(m, T0).find((r) => r.kind !== "review")!
    expect(top.lesson).toBe("l4")
  })

  it("returns something for every possible store", () => {
    expect(recommend({}, T0).length).toBeGreaterThan(0)
    expect(recommend({}, 0).length).toBeGreaterThan(0)
  })
})
