import { useState } from "react"
import { Lesson } from "../components/Lesson"
import { Choice } from "../components/Check"
import { Curve, Dot, Plot, Readout, Slider, VP, type LessonProps } from "./kit"
import { trim } from "../lib/quadratic"

export function L3({ onBack, onNext, onComplete }: LessonProps) {
  const [a, setA] = useState(1)
  const [h, setH] = useState(2)
  const [k, setK] = useState(-1)

  const f = (x: number) => a * (x - h) ** 2 + k
  const sign = (v: number) => (v < 0 ? `+ ${trim(-v)}` : `- ${trim(v)}`)
  const tex = `y = ${a === 1 ? "" : trim(a)}(x ${sign(h)})^2 ${k < 0 ? `- ${trim(-k)}` : `+ ${trim(k)}`}`

  const stage = (
    <>
      <Readout tex={tex} note={`vertex (${trim(h)}, ${trim(k)})`} />
      <Plot vp={VP} label="Completed square form, with its vertex marked">
        <Curve vp={VP} f={f} />
        <Dot vp={VP} x={h} y={k} kind="vertex" />
      </Plot>
      <div className="controls">
        <Slider sym="a" value={a} onChange={setA} min={-2} max={3} step={0.5} />
        <Slider sym="h" value={h} onChange={setH} min={-6} max={6} step={0.5} />
        <Slider sym="k" value={k} onChange={setK} min={-3} max={5} step={0.5} />
      </div>
    </>
  )

  return (
    <Lesson
      title="The vertex, read not calculated"
      stage={stage}
      onBack={onBack}
      onNext={onNext}
      onComplete={onComplete}
      takeaway="Get it into completed square form and the turning point is already written down for you."
      beats={[
        {
          title: "The bracket holds the answer",
          render: () => (
            <>
              <p>In <strong>y = a(x − h)² + k</strong> the vertex sits at <strong>(h, k)</strong>.</p>
              <p>Move the sliders. The marked point never has to be worked out.</p>
            </>
          ),
        },
        {
          title: "Why it has to be there",
          render: () => (
            <p>
              A square is never negative, so <strong>a(x − h)²</strong> is smallest when the bracket
              is zero — which happens at x = h. Everything else is the k on the end.
            </p>
          ),
        },
        {
          title: "The sign trap",
          gate: true,
          render: (solve) => (
            <>
              <p>A minus inside the bracket moves the curve <strong>right</strong>. Almost everyone gets this backwards once.</p>
              <Choice
                question="Where is the vertex of y = (x − 4)² + 3?"
                onSolved={solve}
                options={[
                  { label: "(4, 3)", correct: true, why: "Minus four inside means four to the right." },
                  { label: "(−4, 3)", why: "The sign flips on the way out of the bracket." },
                  { label: "(4, −3)", why: "k is added outside, so it stays as it reads." },
                  { label: "(3, 4)", why: "Right numbers, wrong order — it's (h, k)." },
                ]}
              />
            </>
          ),
        },
      ]}
    />
  )
}
