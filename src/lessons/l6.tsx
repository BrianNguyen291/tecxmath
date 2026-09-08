import { useState } from "react"
import { Lesson } from "../components/Lesson"
import { Choice } from "../components/Check"
import { SignExplorer } from "../components/SignExplorer"
import { Curve, Plot, Readout, Slider, type LessonProps } from "./kit"
import type { Viewport } from "../lib/coords"

/** Taller than the shared viewport: the negative region is the whole point here. */
const VP6: Viewport = { xMin: -8, xMax: 8, yMin: -7.5, yMax: 2.5 }
import { evalQuadratic, quadraticTex } from "../lib/quadratic"

export function L6({ onBack, onNext, onComplete }: LessonProps) {
  const [a, setA] = useState(1)
  const [b, setB] = useState(-1)
  const [c, setC] = useState(-6)
  const q = { a, b, c }

  const stage = (
    <>
      <Readout tex={quadraticTex(q).replace("y =", "")} note="blue where positive, red where negative" />
      <Plot vp={VP6} label="A parabola above and below the axis">
        <Curve vp={VP6} f={(x) => evalQuadratic(q, x)} />
      </Plot>
      <SignExplorer q={q} />
      <div className="controls">
        <Slider sym="a" value={a} onChange={setA} min={-2} max={2} step={0.5} />
        <Slider sym="b" value={b} onChange={setB} min={-6} max={6} step={0.5} />
        <Slider sym="c" value={c} onChange={setC} min={-8} max={5} step={0.5} />
      </div>
    </>
  )

  return (
    <Lesson
      id="l6"
      title="Quadratic inequalities"
      stage={stage}
      onBack={onBack}
      onNext={onNext}
      onComplete={onComplete}
      takeaway="Find the roots, sketch the shape, read off the regions. Never divide an inequality by something that might be negative."
      beats={[
        {
          title: "Solving one is reading a sign",
          render: () => (
            <>
              <p>The roots cut the number line into regions. Inside each region the expression keeps one sign.</p>
              <p>The bar under the graph is that line, coloured.</p>
            </>
          ),
        },
        {
          title: "So sketch it",
          gate: true,
          render: (solve) => (
            <>
              <p>For <strong>x² − x − 6 &gt; 0</strong>, the roots are −2 and 3, and the curve opens upward.</p>
              <Choice
                question="Which region satisfies it?"
                onSolved={solve}
                options={[
                  { label: "x < −2 or x > 3", correct: true, why: "Opens upward, so it's positive outside the roots." },
                  { label: "−2 < x < 3", why: "That's where it dips below the axis — negative, not positive." },
                  { label: "x > −2", why: "Half right. It's negative between the roots." },
                  { label: "All real x", why: "It's negative between −2 and 3." },
                ]}
              />
            </>
          ),
        },
        {
          title: "Then check which way it opens",
          gate: true,
          render: (solve) => (
            <>
              <p>Drag <strong>a</strong> below zero. The colours swap — the outside is now negative.</p>
              <Choice
                question="For a < 0, where is ax² + bx + c positive?"
                onSolved={solve}
                options={[
                  { label: "Between the roots", correct: true, why: "A downward curve pokes above the axis in the middle." },
                  { label: "Outside the roots", why: "That's the upward case. Flipping a flips the answer." },
                  { label: "Nowhere", why: "It still crosses the axis whenever the discriminant is positive." },
                ]}
              />
            </>
          ),
        },
      ]}
    />
  )
}
