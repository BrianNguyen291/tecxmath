import { useState } from "react"
import { Lesson } from "../components/Lesson"
import { Entry } from "../components/Check"
import { Steps } from "../components/Steps"
import { DragPoint } from "../components/DragPoint"
import { Curve, Dot, Plot, Readout, VP, type LessonProps } from "./kit"
import { trim } from "../lib/quadratic"

export function L4({ onBack, onNext, onComplete }: LessonProps) {
  const [p, setP] = useState(-2)
  const [q, setQ] = useState(3)
  const f = (x: number) => 0.5 * (x - p) * (x - q)
  const s = (v: number) => (v < 0 ? `+ ${trim(-v)}` : `- ${trim(v)}`)

  const stage = (
    <>
      <Readout
        tex={`y = \\tfrac12(x ${s(p)})(x ${s(q)})`}
        note={`roots at ${trim(p)} and ${trim(q)}`}
      />
      <Plot vp={VP} label="A parabola pinned to two draggable roots">
        <Curve vp={VP} f={f} />
        <Dot vp={VP} x={(p + q) / 2} y={f((p + q) / 2)} kind="vertex" />
        <DragPoint vp={VP} x={p} y={0} axis="x" step={0.5} range={[-7, q - 0.5]}
          onMove={(x) => setP(x)} label="first root" />
        <DragPoint vp={VP} x={q} y={0} axis="x" step={0.5} range={[p + 0.5, 7]}
          onMove={(x) => setQ(x)} label="second root" />
      </Plot>
    </>
  )

  return (
    <Lesson
      id="l4"
      title="Roots, factors and the formula"
      stage={stage}
      onBack={onBack}
      onNext={onNext}
      onComplete={onComplete}
      takeaway="The quadratic formula is completing the square done once, in general. You just derived it."
      beats={[
        {
          title: "Drag the roots",
          render: () => (
            <>
              <p>Grab either handle on the axis. The curve is pinned to them, and the equation rewrites itself.</p>
              <p className="hint">Handles take keyboard focus too — tab to one, then use the arrow keys.</p>
            </>
          ),
        },
        {
          title: "A product is zero when a factor is",
          render: () => (
            <p>
              <strong>(x − p)(x − q)</strong> can only be zero if one bracket is zero. So the roots
              are p and q, read straight off. That is the entire point of factorising.
            </p>
          ),
        },
        {
          title: "Now do it in general",
          render: () => (
            <>
              <p>Complete the square on <strong>ax² + bx + c = 0</strong> and the formula falls out.</p>
              <Steps
                steps={[
                  { tex: "ax^2 + bx + c = 0", note: "start" },
                  { tex: "x^2 + \\tfrac{b}{a}x = -\\tfrac{c}{a}", note: "divide by a, move c" },
                  { tex: "\\left(x + \\tfrac{b}{2a}\\right)^2 = \\tfrac{b^2}{4a^2} - \\tfrac{c}{a}", note: "add the notch to both sides" },
                  { tex: "\\left(x + \\tfrac{b}{2a}\\right)^2 = \\tfrac{b^2 - 4ac}{4a^2}", note: "one fraction" },
                  { tex: "x = \\tfrac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}", note: "square root, then rearrange" },
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
              question="What is the larger root of x² − 5x + 6 = 0?"
              answer="3"
              placeholder="a number"
              onSolved={solve}
              misread={[
                { expr: "2", why: "That's the smaller one. Both are roots — the question wants the larger." },
                { expr: "-3", why: "Check the signs: (x − 2)(x − 3) gives positive roots." },
                { expr: "6", why: "6 is the product of the roots, not a root." },
              ]}
            />
          ),
        },
      ]}
    />
  )
}
