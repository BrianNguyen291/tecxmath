/**
 * Per-concept mastery, as a decaying half-life.
 *
 * Each concept carries one number: `half`, the number of days after which the
 * student is 50% likely to still have it. Retention at any moment is
 * 0.5 ^ (elapsed / half) — one line, no state machine, readable as a
 * percentage, and defined for every concept at every instant. That last
 * property is what lets "what should I do next?" rank the whole library
 * instead of just listing what is overdue.
 *
 * Correct answers stretch the half-life, misses cut it, and the stretch is
 * proportional to how much had already been forgotten — so cramming the same
 * exercise twice in a minute earns almost nothing while recalling it a week
 * later earns a lot. Nothing here throws: storage may be missing or corrupt.
 */

import { CONCEPTS, isConceptId, type ConceptId } from "./concepts"

const KEY = "tecxmath.mastery.v1"
const DAY = 86_400_000

/** Half-life in days of a concept just met and answered right once. */
const H0 = 0.5
const H_MIN = 0.1
const H_MAX = 180
/** Most a single perfect, hard-won recall can multiply the half-life by. */
const GROWTH = 2.2
/** A miss keeps this fraction of the half-life. */
const LAPSE = 0.45
/** Retention below this means "review it". 0.7 ≈ half-life × 0.51. */
export const REVIEW_AT = 0.7
/** Retention a prerequisite must hold for the next lesson to be worth starting. */
export const READY_AT = 0.6
/** Attempt penalty: 1st try 1.00, 2nd 0.63, 3rd 0.45. */
const ATTEMPT_PENALTY = 0.6
/** Slower than this and a correct answer counts as weaker evidence. */
const SLOW_MS = 45_000
const IGNORE_MS = 600_000
const SLOW_FACTOR = 0.8

/** How much a kind of interaction is allowed to move the number. */
const WEIGHT = {
  /** Answering a Choice or Entry — real retrieval. */
  check: 1,
  /** Hitting a goal on the stage: the challenge gate, the area-model snap. */
  stage: 0.6,
  /** Revealing a derivation in Steps. Exposure, not recall. */
  steps: 0.25,
} as const

export type EvidenceKind = keyof typeof WEIGHT

export type Evidence = {
  concept: ConceptId
  correct: boolean
  /** 1-based try count — Check already keeps this in a ref. */
  attempt?: number
  /** Time spent on the exercise, if the caller has it. */
  ms?: number
  kind?: EvidenceKind
  /** Where it happened. Kept for debugging and later analytics only. */
  lesson?: string
}

export type ConceptState = {
  /** Half-life in days. */
  half: number
  /** When the last piece of evidence arrived. */
  seen: number
  reps: number
  lapses: number
}

export type Mastery = Record<string, ConceptState>

export type Level = "unseen" | "learning" | "familiar" | "solid" | "mastered"

// ---------------------------------------------------------------- model

/** Probability the student still has it, right now. 0 for never seen. */
export function retention(s: ConceptState | undefined, now = Date.now()): number {
  if (!s || s.half <= 0) return 0
  const days = Math.max(0, now - s.seen) / DAY
  return Math.pow(0.5, days / s.half)
}

/** Durability, independent of when you ask: 0 at H_MIN, 1 at H_MAX, log-scaled. */
export function strength(s: ConceptState | undefined): number {
  if (!s) return 0
  const t = Math.log(s.half / H_MIN) / Math.log(H_MAX / H_MIN)
  return Math.min(1, Math.max(0, t))
}

export function level(s: ConceptState | undefined, now = Date.now()): Level {
  if (!s || s.reps === 0) return "unseen"
  const k = strength(s)
  if (k >= 0.85 && retention(s, now) >= REVIEW_AT) return "mastered"
  if (k >= 0.6) return "solid"
  if (k >= 0.3) return "familiar"
  return "learning"
}

/** The moment retention crosses REVIEW_AT. */
export function dueAt(s: ConceptState): number {
  return s.seen + s.half * Math.log2(1 / REVIEW_AT) * DAY
}

export const isDue = (s: ConceptState | undefined, now = Date.now()): boolean =>
  s != null && s.reps > 0 && retention(s, now) < REVIEW_AT

/** Evidence quality in [0, 1]. Wrong is 0; slow-and-right is worth less. */
export function quality(ev: Evidence): number {
  if (!ev.correct) return 0
  const attempt = Number.isFinite(ev.attempt) ? Math.max(1, Math.floor(ev.attempt!)) : 1
  const q = 1 / (1 + ATTEMPT_PENALTY * (attempt - 1))
  const ms = ev.ms
  const slow = typeof ms === "number" && ms > SLOW_MS && ms < IGNORE_MS
  return slow ? q * SLOW_FACTOR : q
}

/**
 * The whole update rule. Pure — takes the old state, returns a new one.
 *
 *   r  = retention right now (0 if new)
 *   q  = quality of this answer (0..1)
 *   w  = weight of this kind of evidence (0..1)
 *
 *   right:  half' = half × (1 + GROWTH·q·w·(1 − r))
 *   wrong:  half' = half × (1 − w·(1 − LAPSE))
 *
 * The (1 − r) term is the spacing effect: answering something you had almost
 * forgotten is worth much more than answering what you just read.
 */
export function applyEvidence(
  prev: ConceptState | undefined,
  ev: Evidence,
  now = Date.now(),
): ConceptState {
  const base: ConceptState = prev ?? { half: H0, seen: now, reps: 0, lapses: 0 }
  const w = WEIGHT[ev.kind ?? "check"] ?? WEIGHT.check
  const q = quality(ev)
  const r = prev ? retention(prev, now) : 0

  const factor = q > 0 ? 1 + GROWTH * q * w * (1 - r) : 1 - w * (1 - LAPSE)
  const half = Math.min(H_MAX, Math.max(H_MIN, base.half * factor))

  return {
    half,
    seen: now,
    reps: base.reps + 1,
    lapses: base.lapses + (q > 0 ? 0 : 1),
  }
}

// ---------------------------------------------------------------- storage

let cache: Mastery | null = null

/** Validates anything claiming to be a store: unknown ids and bad numbers are dropped. */
export function parseMastery(raw: unknown): Mastery {
  const out: Mastery = {}
  if (!raw || typeof raw !== "object") return out
  for (const [id, v] of Object.entries(raw as Record<string, unknown>)) {
    if (!isConceptId(id) || !v || typeof v !== "object") continue
    const s = v as Partial<ConceptState>
    const half = Number(s.half)
    const seen = Number(s.seen)
    if (!Number.isFinite(half) || !Number.isFinite(seen) || half <= 0) continue
    out[id] = {
      half: Math.min(H_MAX, Math.max(H_MIN, half)),
      seen,
      reps: Number.isFinite(s.reps) ? Math.max(0, Math.floor(s.reps as number)) : 1,
      lapses: Number.isFinite(s.lapses) ? Math.max(0, Math.floor(s.lapses as number)) : 0,
    }
  }
  return out
}

/** Never throws. Blocked storage and corrupt JSON both yield the session cache. */
export function loadMastery(): Mastery {
  if (cache) return cache
  try {
    const raw = localStorage.getItem(KEY)
    cache = raw ? parseMastery(JSON.parse(raw)) : {}
  } catch {
    cache = {}
  }
  return cache
}

/**
 * Fold evidence into the store and persist. Returns the new Mastery.
 * The in-memory cache is updated even when persistence fails, so a private
 * window still gets working recommendations for the length of the session.
 */
export function record(evidence: Evidence | Evidence[], now = Date.now()): Mastery {
  const list = (Array.isArray(evidence) ? evidence : [evidence]).filter((e) =>
    e != null && isConceptId(e.concept),
  )
  if (list.length === 0) return loadMastery()

  const next: Mastery = { ...loadMastery() }
  for (const ev of list) next[ev.concept] = applyEvidence(next[ev.concept], ev, now)
  cache = next
  try {
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    /* blocked or full — the session cache still carries it */
  }
  return next
}

export function resetMastery(): Mastery {
  cache = {}
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* nothing to clear */
  }
  return cache
}

/** Every concept with its current numbers — the source for any progress UI. */
export function snapshot(m: Mastery = loadMastery(), now = Date.now()) {
  return Object.values(CONCEPTS).map((c) => {
    const s = m[c.id]
    return {
      concept: c,
      state: s,
      retention: retention(s, now),
      strength: strength(s),
      level: level(s, now),
      due: isDue(s, now),
    }
  })
}
