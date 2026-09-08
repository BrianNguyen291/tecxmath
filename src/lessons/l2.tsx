import { useState } from "react"
import { Lesson, SolveWhen } from "../components/Lesson"
import { Entry } from "../components/Check"
import { AreaModel } from "../components/AreaModel"
import { Steps } from "../components/Steps"
import { Readout, Slider, type LessonProps } from "./kit"
import { trim } from "../lib/quadratic"

export function L2({ onBack, onNext, onComplete }: LessonProps) {
  const [b, setB] = useState(6)
  const [gap, setGap] = useState(false)
  const [placed, setPlaced] = useState(false)

  const stage = (
    <>
      <Readout
        tex={`x^2 + ${trim(b)}x`}
        note={
          placed
            ? `now a full square of side x + ${trim(b / 2)}`
            : gap
              ? `drag the corner in — it is (${trim(b / 2)})² = ${trim((b / 2) ** 2)}`
              : "two strips, one corner missing"
        }
      />
      <AreaModel b={b} showGap={gap} onPlaced={() => setPlaced(true)} />
      <div className="controls">
        <Slider sym="b" value={b} onChange={setB} min={1} max={12} step={1} />
      </div>
    </>
  )

  return (
    <Lesson
      id="l2"
      title="Completing the square"
      stage={stage}
      onBack={onBack}
      onNext={onNext}
      onComplete={onComplete}
      takeaway="Completing the square is literally that — add the missing corner, then take it straight back off."
      beats={[
        {
          title: "x² + bx is a shape",
          render: () => (
            <>
              <p>The big square is <strong>x²</strong>. The two strips are <strong>bx</strong>, split evenly down the middle.</p>
              <p>Drag b and watch the strips grow.</p>
            </>
          ),
        },
        {
          title: "It isn't a square yet",
          gate: true,
          render: (solve) => (
            <>
              <p>There's a notch missing in the corner, exactly <strong>(b/2)²</strong> in area.</p>
              <p>Drag the red square into it.</p>
              <button
                className="btn ghost"
                onClick={() => setGap(true)}
                style={{ marginTop: 12 }}
                disabled={gap}
              >
                {gap ? "Drag it in" : "Show me the piece"}
              </button>
              <SolveWhen on={placed} solve={solve} />
              {placed && <p className="feedback ok">Filled. The shape is a square now.</p>}
            </>
          ),
        },
        {
          title: "Add it, then take it back",
          render: () => (
            <>
              <p>Filling the notch changes the value, so you subtract the same amount immediately.</p>
              <Steps
                steps={[
                  { tex: "x^2 + 6x", note: "start" },
                  { tex: "x^2 + 6x + 9 - 9", note: "add the notch, subtract it again" },
                  { tex: "(x + 3)^2 - 9", note: "the first three terms are a perfect square" },
                ]}
              />
            </>
          ),
        },
        {
          title: "Your turn",
          gate: true,
          render: (solve) => (
            <Entry
              question="Write x² + 8x in completed square form."
              answer="(x+4)^2-16"
              placeholder="(x+…)^2 − …"
              onSolved={solve}
              reject={[
                { expr: "x^2+8x", why: "That's where you started. Rewrite it as a square minus a number." },
              ]}
              misread={[
                { expr: "(x+4)^2", why: "You added 16 but never took it back off." },
                { expr: "(x+8)^2-64", why: "Halve b before it goes in the bracket — 8 halves to 4." },
                { expr: "(x+4)^2+16", why: "Right bracket. The correction is subtracted, not added." },
              ]}
            />
          ),
        },
      ]}
    />
  )
}
