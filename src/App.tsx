import { useCallback, useState } from "react"
import { LESSONS } from "./lessons"
import { load, markDone, reset, type Progress } from "./lib/progress"
import "./components/ui.css"

const Chevron = () => (
  <svg className="row-go" width="8" height="13" viewBox="0 0 8 13" fill="none" aria-hidden="true">
    <path d="M1 1l5.5 5.5L1 12" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const Done = () => (
  <svg className="row-go" width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true"
    style={{ color: "var(--good)" }}>
    <circle cx="10" cy="10" r="9" fill="currentColor" />
    <path d="M5.5 10.4l3 3 6-6.6" stroke="var(--bg)" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export default function App() {
  const [at, setAt] = useState<number | null>(null)
  const [progress, setProgress] = useState<Progress>(load)

  const complete = useCallback((id: string) => setProgress(markDone(id)), [])
  const home = useCallback(() => setAt(null), [])

  if (at !== null) {
    const lesson = LESSONS[at]
    const { Component } = lesson
    return (
      <Component
        key={lesson.id}
        onBack={home}
        onNext={at + 1 < LESSONS.length ? () => setAt(at + 1) : undefined}
        onComplete={() => complete(lesson.id)}
      />
    )
  }

  const doneCount = LESSONS.filter((l) => progress[l.id]?.done).length

  return (
    <div className="app">
      <main className="home">
        <p className="home-eyebrow">A-level Pure · Year 1</p>
        <h1>Quadratics</h1>
        <p className="home-sub">
          Seven lessons. Every idea is something you move, not something you watch.
        </p>

        <div className="list">
          {LESSONS.map((l, i) => {
            const finished = progress[l.id]?.done
            return (
              <button className="row" key={l.id} onClick={() => setAt(i)}>
                <span className="row-n">{i + 1}</span>
                <span className="row-body">
                  <span className="row-t">{l.title}</span>
                  <span className="row-d">{l.idea}</span>
                </span>
                {finished ? <Done /> : <Chevron />}
              </button>
            )
          })}
        </div>

        <div style={{ marginTop: 28, display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 14, color: "var(--text-2)" }}>
            {doneCount} of {LESSONS.length} complete
          </span>
          {doneCount > 0 && (
            <button
              className="row-d"
              style={{ color: "var(--accent)", fontSize: 14, padding: 0 }}
              onClick={() => setProgress(reset())}
            >
              Reset
            </button>
          )}
        </div>
      </main>
    </div>
  )
}
