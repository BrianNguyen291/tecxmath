import { useState } from "react"
import { Lesson } from "../components/Lesson"
import { Entry } from "../components/Check"
import { Steps } from "../components/Steps"
import { Curve, Dot, Plot, Slider, type LessonProps } from "./kit"
import { Tex } from "../components/Tex"
import type { Viewport } from "../lib/coords"
import { roots, trim } from "../lib/quadratic"

const VP_U: Viewport = { xMin: -2, xMax: 8, yMin: -5, yMax: 1.25 }
const VP_X: Viewport = { xMin: -3.2, xMax: 3.2, yMin: -5, yMax: 1.4 }

export function L7({ onBack, onNext, onComplete }: LessonProps) {
  const [b, setB] = useState(-5)
  const [c, setC] = useState(4)

  // The same coefficients read two ways: as a quadratic in u, and as a quartic in x.
  const u = { a: 1, b, c }
  const uRoots = roots(u)
  const xRoots = uRoots.filter((r) => r >= 0).flatMap((r) => (r === 0 ? [0] : [-Math.sqrt(r), Math.sqrt(r)]))
  const lost = uRoots.filter((r) => r < 0).length

  const stage = (
    <>
      <div className="readout">
        <span className="readout-main">
          <Tex>{`u^2 ${b < 0 ? "-" : "+"} ${trim(Math.abs(b))}u ${c < 0 ? "-" : "+"} ${trim(Math.abs(c))}`}</Tex>
        </span>
        <span className="readout-note">
          {uRoots.length ? `u = ${uRoots.map(trim).join(", ")}` : "no real u"}
        </span>
      </div>
      <Plot vp={VP_U} label="The quadratic in u" xStep={1} yStep={1}>
        <Curve vp={VP_U} f={(x) => x * x + b * x + c} />
        {uRoots.map((r) => <Dot key={r} vp={VP_U} x={r} y={0} />)}
      </Plot>

      <div className="readout">
        <span className="readout-main">
          <Tex>{`x^4 ${b < 0 ? "-" : "+"} ${trim(Math.abs(b))}x^2 ${c < 0 ? "-" : "+"} ${trim(Math.abs(c))}`}</Tex>
        </span>
        <span className="readout-note">
          {xRoots.length ? `x = ${xRoots.map(trim).join(", ")}` : "no real x"}
          {lost > 0 && ` · ${lost} negative u gives nothing`}
        </span>
      </div>
      <Plot vp={VP_X} label="The same coefficients as a quartic in x" xStep={1} yStep={1}>
        <Curve vp={VP_X} f={(x) => x ** 4 + b * x * x + c} />
        {xRoots.map((r) => <Dot key={r} vp={VP_X} x={r} y={0} />)}
      </Plot>

      <div className="controls">
        <Slider sym="b" value={b} onChange={setB} min={-8} max={4} step={0.5} />
        <Slider sym="c" value={c} onChange={setC} min={-4} max={8} step={0.5} />
      </div>
    </>
  )

  return (
    <Lesson
      id="l7"
      title="Disguised quadratics"
      stage={stage}
      onBack={onBack}
      onNext={onNext}
      onComplete={onComplete}
      takeaway="If the same block appears twice — once squared, once alone — it's a quadratic. Name it u, solve, then come back to x."
      beats={[
        {
          title: "Two graphs, one problem",
          render: () => (
            <>
              <p>Both plots use the same <strong>b</strong> and <strong>c</strong>. The top one is a quadratic in <strong>u</strong>; the bottom is a quartic in <strong>x</strong>.</p>
              <p>Move the sliders and watch the roots move together.</p>
            </>
          ),
        },
        {
          title: "Each u root splits in two",
          render: () => (
            <>
              <p>Because <strong>u = x²</strong>, a root at u = 4 becomes x = 2 <em>and</em> x = −2.</p>
              <p>That's why the bottom curve has twice as many crossings — and why it is symmetric.</p>
            </>
          ),
        },
        {
          title: "Unless u is negative",
          gate: true,
          render: (solve) => (
            <>
              <p>Drag <strong>c</strong> below zero. One u root goes negative, and the bottom curve <em>loses</em> a pair of crossings — nothing squares to give a negative.</p>
              <Entry
                question="If the u-quadratic has roots u = 9 and u = −1, how many real values of x are there?"
                answer="2"
                placeholder="a number"
                onSolved={solve}
                misread={[
                  { expr: "4", why: "Only u = 9 splits. A negative u contributes no real x." },
                  { expr: "3", why: "Roots come in ± pairs unless u = 0. There is no odd count here." },
                  { expr: "1", why: "u = 9 gives both +3 and −3." },
                ]}
              />
            </>
          ),
        },
        {
          title: "Doing it on paper",
          render: () => (
            <Steps
              steps={[
                { tex: "x^4 - 5x^2 + 4 = 0", note: "start" },
                { tex: "u = x^2", note: "name the repeated block" },
                { tex: "u^2 - 5u + 4 = 0", note: "an ordinary quadratic" },
                { tex: "(u - 1)(u - 4) = 0", note: "factorise" },
                { tex: "x^2 = 1 \\quad\\text{or}\\quad x^2 = 4", note: "substitute back — the step people forget" },
                { tex: "x = \\pm 1, \; \\pm 2", note: "four roots, matching the lower graph" },
              ]}
            />
          ),
        },
        {
          title: "Your turn",
          gate: true,
          render: (solve) => (
            <>
              <p>The same move works for a quadratic in <strong>√x</strong>, in <strong>eˣ</strong>, or in <strong>sin x</strong>.</p>
              <Entry
                question="Solve x⁴ − 13x² + 36 = 0. Give the largest root."
                answer="3"
                placeholder="a number"
                onSolved={solve}
                misread={[
                  { expr: "9", why: "That's a value of u. Square root it to get back to x." },
                  { expr: "2", why: "A root, but not the largest — u = 9 gives a bigger one." },
                  { expr: "6", why: "Check the factorising: 36 = 4 × 9, and 4 + 9 = 13." },
                ]}
              />
            </>
          ),
        },
      ]}
    />
  )
}
