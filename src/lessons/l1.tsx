import { useState } from "react"
import { Lesson } from "../components/Lesson"
import { Choice } from "../components/Check"
import { Curve, Plot, Readout, Slider, VP, type LessonProps } from "./kit"
import { evalQuadratic, quadraticTex } from "../lib/quadratic"

export function L1({ onBack, onNext, onComplete }: LessonProps) {
  const [a, setA] = useState(1)
  const [b, setB] = useState(0)
  const [c, setC] = useState(0)
  const q = { a, b, c }

  const stage = (
    <>
      <Readout tex={quadraticTex(q)} />
      <Plot vp={VP} label="A parabola you can reshape">
        <Curve vp={VP} f={(x) => x * x} ghost />
        <Curve vp={VP} f={(x) => evalQuadratic(q, x)} />
      </Plot>
      <div className="controls">
        <Slider sym="a" value={a} onChange={setA} min={-3} max={3} />
        <Slider sym="b" value={b} onChange={setB} min={-6} max={6} />
        <Slider sym="c" value={c} onChange={setC} min={-3} max={5} />
      </div>
    </>
  )

  return (
    <Lesson
      id="l1"
      title="The curve and its coefficients"
      stage={stage}
      onBack={onBack}
      onNext={onNext}
      onComplete={onComplete}
      takeaway="a shapes it, c lifts it, b slides it sideways. That last one is why the next lesson rewrites the equation."
      beats={[
        {
          title: "Three dials, one curve",
          render: () => (
            <>
              <p>This is <strong>y = x²</strong>. Every height is a distance from zero, squared.</p>
              <p>The dotted curve stays put so you can see what you changed.</p>
            </>
          ),
        },
        {
          title: "a sets the shape",
          gate: true,
          render: (solve) => (
            <>
              <p>Positive opens upward, negative flips it. Bigger means narrower.</p>
              <Choice
                question="Which value of a gives the widest curve?"
                onSolved={solve}
                options={[
                  { label: "a = 0.2", correct: true, why: "Smaller a, flatter curve." },
                  { label: "a = 1", why: "That's the plain x² you started with." },
                  { label: "a = 3", why: "Larger a pinches it narrower, not wider." },
                  { label: "a = −3", why: "That flips it over — and it's still narrow." },
                ]}
              />
            </>
          ),
        },
        {
          title: "c lifts it",
          gate: true,
          render: (solve) => (
            <>
              <p>The shape never changes. It only slides up and down.</p>
              <Choice
                question="Where does y = x² + 5 cross the y-axis?"
                onSolved={solve}
                options={[
                  { label: "(0, 5)", correct: true, why: "c is the height at x = 0." },
                  { label: "(5, 0)", why: "That's on the x-axis. c moves it vertically." },
                  { label: "(0, 25)", why: "No squaring here — c is added, not squared." },
                ]}
              />
            </>
          ),
        },
        {
          title: "b is the odd one",
          gate: true,
          render: (solve) => (
            <>
              <p>Drag b. The curve slides <strong>diagonally</strong> — sideways and down together.</p>
              <p>It's the only coefficient you can't read straight off the picture.</p>
              <Choice
                question="What does b = 0 tell you?"
                onSolved={solve}
                options={[
                  { label: "The curve is symmetric about the y-axis", correct: true,
                    why: "With no b, the turning point sits on the y-axis." },
                  { label: "The curve passes through the origin", why: "That's c = 0." },
                  { label: "The curve has no roots", why: "y = x² − 4 has b = 0 and two roots." },
                ]}
              />
            </>
          ),
        },
      ]}
    />
  )
}
