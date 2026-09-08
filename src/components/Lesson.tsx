import { type ReactNode, useCallback, useEffect, useRef, useState } from "react"
import "./ui.css"

export type Beat = {
  title?: string
  /** `solve` unlocks Continue for a gated beat. */
  render: (solve: () => void) => ReactNode
  gate?: boolean
}

type Props = {
  title: string
  stage: ReactNode
  beats: Beat[]
  takeaway: string
  onBack: () => void
  onNext?: () => void
  onComplete?: () => void
}

export function Lesson({ title, stage, beats, takeaway, onBack, onNext, onComplete }: Props) {
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

  useEffect(() => {
    if (step > 0) tail.current?.scrollIntoView({ behavior: "smooth", block: "nearest" })
  }, [step])

  useEffect(() => {
    if (done) onComplete?.()
  }, [done, onComplete])

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

      <main className="lesson">
        <div className="stage">{stage}</div>

        <div className="beats">
          {beats.slice(0, step + 1).map((b, i) => (
            <section className="beat" key={i}>
              {b.title && <h2 className="beat-h">{b.title}</h2>}
              {b.render(() => solve(i))}
            </section>
          ))}

          {!done && (
            <button
              className="btn"
              onClick={() => setStep((s) => s + 1)}
              disabled={locked}
              style={locked ? { opacity: 0.35, cursor: "default" } : undefined}
            >
              {locked ? "Answer to continue" : "Continue"}
            </button>
          )}

          {done && (
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
