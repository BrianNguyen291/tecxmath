const KEY = "quadratics.progress.v1"

export type Progress = Record<string, { done: boolean; at: number }>

/** Reads never throw — private browsing and blocked storage return an empty record. */
export function load(): Progress {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Progress) : {}
  } catch {
    return {}
  }
}

export function markDone(id: string): Progress {
  const next = { ...load(), [id]: { done: true, at: Date.now() } }
  try {
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    /* storage unavailable — progress is lost, the lesson still works */
  }
  return next
}

export function reset(): Progress {
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* nothing to clear */
  }
  return {}
}
