import { useState } from "react"
import { Lesson } from "../components/Lesson"
import { Choice, Entry } from "../components/Check"
import { Curve, Dot, Plot, Slider, VP, type LessonProps } from "./kit"
import type { ReactNode } from "react"
import type { Variant } from "../components/Lesson"
import { discriminant, evalQuadratic, roots, trim } from "../lib/quadratic"

export function L5({ onBack, onNext, onComplete, variant, toolbar }: LessonProps & { variant?: Variant; toolbar?: ReactNode }) {
  const [a, setA] = useState(1)
  const [b, setB] = useState(-2)
  const [c, setC] = useState(-2)
  const q = { a, b, c }
  const d = discriminant(q)
  const rs = roots(q)

  const verdict = d > 1e-9 ? "two roots" : d < -1e-9 ? "no real roots" : "one repeated root"
  const colour = d > 1e-9 ? "var(--accent)" : d < -1e-9 ? "var(--accent-2)" : "var(--text)"

  const stage = (
    <>
      <div className="readout">
        <span className="readout-main" style={{ color: colour, fontVariantNumeric: "tabular-nums" }}>
          b² − 4ac = {trim(d)}
        </span>
        <span className="readout-note">{verdict}</span>
      </div>
      <Plot vp={VP} label="A parabola with its roots marked as the discriminant changes">
        <Curve vp={VP} f={(x) => evalQuadratic(q, x)} />
        {rs.map((r) => <Dot key={r} vp={VP} x={r} y={0} />)}
      </Plot>
      <div className="controls">
        <Slider sym="a" value={a} onChange={setA} min={-2} max={3} step={0.5} />
        <Slider sym="b" value={b} onChange={setB} min={-6} max={6} step={0.5} />
        <Slider sym="c" value={c} onChange={setC} min={-5} max={5} step={0.5} />
      </div>
    </>
  )

  return (
    <Lesson
      id="l5"
      title="The discriminant"
      variant={variant}
      toolbar={toolbar}
      challenge={{
        prompt: "Make the curve miss the x-axis completely.",
        hint: "Lift it with c until the two red dots meet and disappear. Watch the number above the graph as they go.",
        solved: d < -1e-9,
      }}
      stage={stage}
      onBack={onBack}
      onNext={onNext}
      onComplete={onComplete}
      takeaway="b² − 4ac counts the crossings. Positive two, zero one, negative none."
      beats={[
        {
          title: "Two, one, or none",
          render: () => (
            <>
              <p>A parabola meets the x-axis twice, once, or never.</p>
              <p>Drag <strong>c</strong> slowly upward and watch the two dots slide together and vanish.</p>
            </>
          ),
        },
        {
          title: "One number decides it",
          gate: true,
          render: (solve) => (
            <>
              <p>The readout is <strong>b² − 4ac</strong>. It changes sign at the exact moment the curve lifts clear of the axis.</p>
              <Choice
                question="The curve misses the axis entirely. What do you know about b² − 4ac?"
                onSolved={solve}
                options={[
                  { label: "It is negative", correct: true, why: "No crossings means a negative discriminant." },
                  { label: "It is zero", why: "Zero is the touching case — exactly one crossing." },
                  { label: "It is positive", why: "Positive gives two crossings." },
                  { label: "It depends on the sign of a", why: "a flips the curve, but the count is the same either way." },
                ]}
              />
            </>
          ),
        },
        {
          title: "The touching case",
          gate: true,
          render: (solve) => (
            <>
              <p>At exactly zero the curve grazes the axis once. That's a repeated root.</p>
              <Entry
                question="For y = x² + 6x + c, what value of c makes the discriminant zero?"
                answer="9"
                placeholder="a number"
                onSolved={solve}
                misread={[
                  { expr: "36", why: "That's b². You still need to divide by 4a." },
                  { expr: "-9", why: "Right size, wrong sign — solve 36 − 4c = 0." },
                  { expr: "3", why: "That's b/2. The discriminant needs (b/2)²." },
                ]}
              />
            </>
          ),
        },
        {
          title: "Where it comes from",
          render: () => (
            <p>
              It is the part under the square root in the formula. A negative number there has no
              real square root, so there is no real answer — which is exactly the curve missing the axis.
            </p>
          ),
        },
      ]}
    />
  )
}
