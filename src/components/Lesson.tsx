import { createContext, type ReactNode, useCallback, useContext, useEffect, useRef, useState } from "react"
import { track } from "../lib/track"
import "./ui.css"

export type Beat = {
  title?: string
  /** `solve` unlocks Continue for a gated beat. */
  render: (solve: () => void) => ReactNode
  gate?: boolean
}

export type Variant = "guided" | "challenge" | "focus"

type Props = {
  id: string
  title: string
  variant?: Variant
  /** Challenge mode only: a goal the student must reach on the stage before the
   *  explanation unlocks. Productive struggle before the telling. */
  challenge?: { prompt: string; hint: string; solved: boolean }
  /** Rendered above the layout — used by the comparison screen. */
  toolbar?: ReactNode
  stage: ReactNode
  beats: Beat[]
  takeaway: string
  onBack: () => void
  onNext?: () => void
  onComplete?: () => void
}

const Where = createContext<{ lesson: string; beat: number }>({ lesson: "?", beat: -1 })
export const useWhere = () => useContext(Where)

export function Lesson({ id, title, variant = "guided", challenge, toolbar, stage, beats, takeaway, onBack, onNext, onComplete }: Props) {
  const [step, setStep] = useState(0)
  const [solved, setSolved] = useState<Set<number>>(new Set())
  const tail = useRef<HTMLDivElement>(null)

  const solve = useCallback(
    (i: number) => setSolved((s) => (s.has(i) ? s : new Set(s).add(i))),
    [],
  )

  const done = step >= beats.length
  const current = beats[step]
  const locked = !done && current?.gate === true && !solved.has(step)

  // In challenge mode the whole sequence waits until the student has reached the goal.
  const held = variant === "challenge" && challenge != null && !challenge.solved
  const [peeked, setPeeked] = useState(false)

  useEffect(() => {
    track("lesson_open", id)
    const started = Date.now()
    return () => track("lesson_abandon", id, { ms: Date.now() - started })
  }, [id])

  useEffect(() => {
    if (step === 0) return
    track("beat_advance", id, { beat: step })
    tail.current?.scrollIntoView({ behavior: "smooth", block: "nearest" })
  }, [step, id])

  useEffect(() => {
    if (!done) return
    track("lesson_complete", id)
    onComplete?.()
  }, [done, onComplete, id])

  return (
    <div className="app">
      <header className="bar">
        <button className="bar-back" onClick={onBack}>
          <svg width="9" height="15" viewBox="0 0 9 15" fill="none" aria-hidden="true">
            <path d="M7.5 1L1.5 7.5l6 6.5" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Lessons
        </button>
        <span className="bar-title">{title}</span>
        <span className="bar-spacer" />
        <div className="pips" role="progressbar" aria-valuenow={step} aria-valuemax={beats.length}>
          {beats.map((_, i) => (
            <span key={i} className={`pip ${i < step ? "on" : ""} ${i === step ? "now" : ""}`} />
          ))}
        </div>
      </header>

      {toolbar}

      <main className={`lesson lesson-${variant}`}>
        <div className="stage">{stage}</div>

        <div className="beats">
          {held && (
            <section className="beat challenge">
              <span className="challenge-k">Try it first</span>
              <h2 className="beat-h">{challenge.prompt}</h2>
              <p>Work it out on the graph. The explanation opens once you get there.</p>
              {peeked ? (
                <p className="hint">{challenge.hint}</p>
              ) : (
                <button className="btn ghost" onClick={() => setPeeked(true)}>Give me a hint</button>
              )}
            </section>
          )}
          {!held && challenge && variant === "challenge" && (
            <p className="feedback ok" style={{ marginBottom: 4 }}>Got it. Here's what just happened.</p>
          )}

          {!held && beats.slice(0, step + 1).map((b, i) => (
            <section className="beat" key={i}>
              {b.title && <h2 className="beat-h">{b.title}</h2>}
              <Where.Provider value={{ lesson: id, beat: i }}>
                {b.render(() => solve(i))}
              </Where.Provider>
            </section>
          ))}

          {!done && !held && (
            <button
              className="btn"
              onClick={() => setStep((s) => s + 1)}
              disabled={locked}
              style={locked ? { opacity: 0.35, cursor: "default" } : undefined}
            >
              {locked ? "Answer to continue" : "Continue"}
            </button>
          )}

          {done && !held && (
            <div className="done">
              <span className="done-k">Takeaway</span>
              <p className="done-t">{takeaway}</p>
              <div style={{ display: "flex", gap: 10 }}>
                {onNext && <button className="btn" onClick={onNext}>Next lesson</button>}
                <button className="btn ghost" onClick={onBack}>All lessons</button>
              </div>
            </div>
          )}
          <div ref={tail} />
        </div>
      </main>
    </div>
  )
}

/** Unlocks a gated beat when `on` becomes true. Keeps solve() out of render. */
export function SolveWhen({ on, solve }: { on: boolean; solve: () => void }) {
  useEffect(() => {
    if (on) solve()
  }, [on, solve])
  return null
}
