/**
 * "What should this student do next?" — one ranked list across every lesson in
 * the library. Policy lives here; the model lives in mastery.ts.
 *
 * Four rules, applied in order:
 *   1. REVIEW    a concept the student once knew has decayed below REVIEW_AT.
 *                Most-decayed × most-important first, capped so review never
 *                swallows the session.
 *   2. SHORE UP  the next unstarted lesson has a prerequisite below READY_AT.
 *                Send them to that prerequisite's own lesson instead.
 *   3. LEARN     the next lesson in course order whose prerequisites hold.
 *   4. EXTEND    everything is learned and fresh — offer the weakest concept.
 */

import {
  CONCEPTS, SYLLABUS, anchorLesson, prerequisitesOf, teachesOf, type ConceptId,
} from "./concepts"
import {
  READY_AT, isDue, loadMastery, retention, type Mastery,
} from "./mastery"

const MAX_REVIEWS = 2

export type Recommendation = {
  kind: "review" | "shore-up" | "learn" | "extend"
  lesson: string
  concept?: ConceptId
  /** One line the UI can show verbatim. */
  reason: string
  /** Higher is more urgent. Only meaningful within a list. */
  score: number
}

const pct = (r: number) => `${Math.round(r * 100)}%`

/** Concepts that have decayed, worst first. */
function reviews(m: Mastery, now: number): Recommendation[] {
  return Object.values(CONCEPTS)
    .filter((c) => isDue(m[c.id], now))
    .map((c) => {
      const r = retention(m[c.id], now)
      return {
        kind: "review" as const,
        lesson: anchorLesson(c.id) ?? SYLLABUS[0].lesson,
        concept: c.id,
        reason: `${c.title} — down to about ${pct(r)}. Worth a look.`,
        score: (1 - r) * c.weight + 1,
      }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_REVIEWS)
}

/**
 * The first lesson in course order teaching a concept never met. Decayed-but-met
 * concepts are deliberately *not* counted here — those belong to the review
 * lane, and counting them would send a student back to lesson one forever.
 */
function nextUnlearned(m: Mastery) {
  return SYLLABUS.find((s) => s.teaches.some((id) => !m[id]))
}

/** A prerequisite of `lesson` that is too weak to build on, weakest first. */
function weakPrereq(lesson: string, m: Mastery, now: number): ConceptId | undefined {
  const taught = new Set(teachesOf(lesson))
  const needed = [...new Set(teachesOf(lesson).flatMap(prerequisitesOf))]
    .filter((id) => !taught.has(id))
  return needed
    .filter((id) => retention(m[id], now) < READY_AT)
    .sort((a, b) => retention(m[a], now) - retention(m[b], now))[0]
}

export function recommend(m: Mastery = loadMastery(), now = Date.now()): Recommendation[] {
  const out = reviews(m, now)
  // One row per lesson: a review already sends them there, so don't say it twice.
  const ranked = (list: Recommendation[]) =>
    [...list]
      .sort((a, b) => b.score - a.score)
      .filter((r, i, all) => all.findIndex((o) => o.lesson === r.lesson) === i)
  const target = nextUnlearned(m)

  if (!target) {
    const weakest = Object.values(CONCEPTS)
      .sort((a, b) => retention(m[a.id], now) - retention(m[b.id], now))[0]
    out.push({
      kind: "extend",
      lesson: anchorLesson(weakest.id) ?? SYLLABUS[SYLLABUS.length - 1].lesson,
      concept: weakest.id,
      reason: `All seven are holding. ${weakest.title} is the softest — keep it sharp.`,
      score: 0.5,
    })
    return ranked(out)
  }

  const gap = weakPrereq(target.lesson, m, now)
  const gapLesson = gap ? anchorLesson(gap) : undefined

  if (gap && gapLesson && gapLesson !== target.lesson) {
    out.push({
      kind: "shore-up",
      lesson: gapLesson,
      concept: gap,
      reason: `${CONCEPTS[gap].title} comes first — the next lesson leans on it.`,
      score: 1.5,
    })
    return ranked(out)
  }

  const fresh = target.teaches.find((id) => !m[id]) ?? target.teaches[0]
  out.push({
    kind: "learn",
    lesson: target.lesson,
    concept: fresh,
    reason: m[fresh] ? `Carry on with ${CONCEPTS[fresh].title}.` : `New: ${CONCEPTS[fresh].title}.`,
    score: 1,
  })
  return ranked(out)
}

/** The single thing to put on the home screen's primary button. */
export const nextUp = (m: Mastery = loadMastery(), now = Date.now()): Recommendation | undefined =>
  recommend(m, now)[0]
