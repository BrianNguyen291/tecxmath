/**
 * Event log for the Tier 2 validation plan: ship publicly, measure where students
 * stop. No backend yet, so events buffer in localStorage behind a pluggable sink —
 * point `SINK` at a collector later and nothing else changes.
 */

export type Event = {
  t: number
  name:
    | "lesson_open"
    | "beat_advance"
    | "check_attempt"
    | "lesson_complete"
    | "lesson_abandon"
    | "stage_interact"
  lesson: string
  beat?: number
  correct?: boolean
  attempt?: number
  ms?: number
  detail?: string
}

const KEY = "tecxmath.events.v1"
const CAP = 2000

/** Replace with a POST to a collector when one exists. */
const SINK: ((e: Event) => void) | null = null

let buffer: Event[] = read()

function read(): Event[] {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Event[]) : []
  } catch {
    return []
  }
}

function flush() {
  try {
    localStorage.setItem(KEY, JSON.stringify(buffer.slice(-CAP)))
  } catch {
    /* storage full or blocked — keep going, events are best-effort */
  }
}

export function track(name: Event["name"], lesson: string, extra: Partial<Event> = {}) {
  const e: Event = { t: Date.now(), name, lesson, ...extra }
  buffer.push(e)
  if (buffer.length > CAP) buffer = buffer.slice(-CAP)
  flush()
  try {
    SINK?.(e)
  } catch {
    /* a failing sink must never break a lesson */
  }
}

export const events = () => [...buffer]

export function clearEvents() {
  buffer = []
  flush()
}

/** Drop-off by lesson — the number the validation plan actually needs. */
export function funnel() {
  const byLesson = new Map<string, { opened: number; completed: number; lastBeat: number }>()
  for (const e of buffer) {
    const row = byLesson.get(e.lesson) ?? { opened: 0, completed: 0, lastBeat: 0 }
    if (e.name === "lesson_open") row.opened++
    if (e.name === "lesson_complete") row.completed++
    if (e.name === "beat_advance" && (e.beat ?? 0) > row.lastBeat) row.lastBeat = e.beat ?? 0
    byLesson.set(e.lesson, row)
  }
  return [...byLesson.entries()].map(([lesson, r]) => ({ lesson, ...r }))
}

/** First-attempt accuracy per exercise — flags questions that are broken, not hard. */
export function checkStats() {
  const seen = new Map<string, { first: number; firstRight: number; total: number; right: number }>()
  for (const e of buffer) {
    if (e.name !== "check_attempt") continue
    const k = `${e.lesson}#${e.beat}`
    const r = seen.get(k) ?? { first: 0, firstRight: 0, total: 0, right: 0 }
    r.total++
    if (e.correct) r.right++
    if (e.attempt === 1) {
      r.first++
      if (e.correct) r.firstRight++
    }
    seen.set(k, r)
  }
  return [...seen.entries()].map(([k, r]) => ({
    exercise: k,
    firstTryAccuracy: r.first ? r.firstRight / r.first : null,
    attempts: r.total,
  }))
}

export function exportJson(): string {
  return JSON.stringify({ exported: Date.now(), funnel: funnel(), checks: checkStats(), events: buffer }, null, 2)
}
