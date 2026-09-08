import { useCallback, useState } from "react"
import { L5 } from "./lessons/l5"
import type { Variant } from "./components/Lesson"
import { COMING, LESSONS } from "./lessons"
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
  const [compare, setCompare] = useState<Variant | null>(null)
  const [progress, setProgress] = useState<Progress>(load)

  const complete = useCallback((id: string) => setProgress(markDone(id)), [])
  const home = useCallback(() => setAt(null), [])

  if (compare) {
    const VARIANTS: { k: Variant; label: string; note: string }[] = [
      { k: "guided", label: "Guided", note: "Stage pinned, prose advances beside it. Calm and controlled — you always know where you are. Risks being passive: the student reads, then confirms." },
      { k: "challenge", label: "Challenge", note: "The goal comes before the explanation. You must reach it on the graph before anything is told to you. Highest chance of real learning, highest chance of frustration." },
      { k: "focus", label: "Focus", note: "One column, stage full width, prose in a single card beneath. Least chrome, most room for the graph. Loses the side-by-side reading of text against picture." },
    ]
    const meta = VARIANTS.find((v) => v.k === compare)!
    return (
      <L5
        key={compare}
        variant={compare}
        onBack={() => setCompare(null)}
        toolbar={
          <div className="compare">
            <span className="compare-k">Layout</span>
            <div className="seg">
              {VARIANTS.map((v) => (
                <button key={v.k} className={v.k === compare ? "on" : ""} onClick={() => setCompare(v.k)}>
                  {v.label}
                </button>
              ))}
            </div>
            <p className="compare-note">{meta.note}</p>
          </div>
        }
      />
    )
  }

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
        <p className="home-brand">TecxMath</p>
        <h1>Quadratics</h1>
        <p className="home-sub">
          A-level Pure, Year 1. Seven lessons — every idea is something you move,
          not something you watch.
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

        <h2 className="home-next">Coming next</h2>
        <div className="list">
          {COMING.map((title) => (
            <button className="row" key={title} disabled>
              <span className="row-n">—</span>
              <span className="row-body">
                <span className="row-t">{title}</span>
              </span>
              <span className="row-soon">Soon</span>
            </button>
          ))}
        </div>

        <h2 className="home-next">Decide</h2>
        <div className="list">
          <button className="row" onClick={() => setCompare("guided")}>
            <span className="row-n">⌥</span>
            <span className="row-body">
              <span className="row-t">Compare layouts</span>
              <span className="row-d">The same lesson three ways — pick the one the product should use</span>
            </span>
            <Chevron />
          </button>
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
