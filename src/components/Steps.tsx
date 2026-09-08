import { useState } from "react"
import { Tex } from "./Tex"

export type Step = { tex: string; note?: string }

/** P4 — a derivation revealed one line at a time, each line saying what changed. */
export function Steps({ steps, onDone }: { steps: Step[]; onDone?: () => void }) {
  const [n, setN] = useState(1)
  const more = n < steps.length

  const next = () => {
    const v = n + 1
    setN(v)
    if (v >= steps.length) onDone?.()
  }

  return (
    <div className="ex">
      <div className="steps">
        {steps.slice(0, n).map((s, i) => (
          <div className="step" key={i}>
            <span className="step-tex"><Tex>{s.tex}</Tex></span>
            {s.note && <span className="step-note">{s.note}</span>}
          </div>
        ))}
      </div>
      {more && (
        <button className="btn ghost" onClick={next}>Next step</button>
      )}
    </div>
  )
}
