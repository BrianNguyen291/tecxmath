import { Lesson } from "../components/Lesson"
import { Entry } from "../components/Check"
import { Steps } from "../components/Steps"
import { Curve, Plot, Readout, type LessonProps } from "./kit"
import type { Viewport } from "../lib/coords"

const VP4: Viewport = { xMin: -3.2, xMax: 3.2, yMin: -4, yMax: 6 }

export function L7({ onBack, onNext, onComplete }: LessonProps) {
  const stage = (
    <>
      <Readout tex="y = x^4 - 5x^2 + 4" note="four roots: −2, −1, 1, 2" />
      <Plot vp={VP4} label="A quartic that is quadratic in x squared" xStep={1} yStep={1}>
        <Curve vp={VP4} f={(x) => x ** 4 - 5 * x * x + 4} />
      </Plot>
    </>
  )

  return (
    <Lesson
      title="Disguised quadratics"
      stage={stage}
      onBack={onBack}
      onNext={onNext}
      onComplete={onComplete}
      takeaway="If the same block appears twice — once squared, once alone — it's a quadratic. Name it u."
      beats={[
        {
          title: "Same problem, new costume",
          render: () => (
            <>
              <p><strong>x⁴ − 5x² + 4 = 0</strong> looks like a quartic. It isn't, really.</p>
              <p>It's a quadratic in <strong>x²</strong>. The block x² shows up squared, then on its own.</p>
            </>
          ),
        },
        {
          title: "Name the block",
          render: () => (
            <Steps
              steps={[
                { tex: "x^4 - 5x^2 + 4 = 0", note: "start" },
                { tex: "u = x^2", note: "name the repeated block" },
                { tex: "u^2 - 5u + 4 = 0", note: "now it's an ordinary quadratic" },
                { tex: "(u - 1)(u - 4) = 0", note: "factorise" },
                { tex: "x^2 = 1 \\quad\\text{or}\\quad x^2 = 4", note: "substitute back" },
                { tex: "x = \\pm 1, \; \\pm 2", note: "four roots — matching the graph" },
              ]}
            />
          ),
        },
        {
          title: "Your turn",
          gate: true,
          render: (solve) => (
            <Entry
              question="Solve x⁴ − 13x² + 36 = 0. Give the largest root."
              answer="3"
              placeholder="a number"
              onSolved={solve}
              misread={[
                { expr: "9", why: "That's a value of u, not of x. Take the square root." },
                { expr: "2", why: "Also a root, but not the largest one." },
                { expr: "36", why: "That's the constant term." },
              ]}
            />
          ),
        },
        {
          title: "It generalises",
          render: () => (
            <p>
              The same move works for a quadratic in <strong>√x</strong>, in <strong>eˣ</strong>,
              or in <strong>sin x</strong>. Spot the repeated block, call it u, solve, substitute back.
            </p>
          ),
        },
      ]}
    />
  )
}
