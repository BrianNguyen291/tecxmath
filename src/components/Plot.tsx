import type { ReactNode, Ref } from "react"
import { BOX, type Viewport, toPx, ticks } from "../lib/coords"
import "./plot.css"

type Props = {
  vp: Viewport
  children?: ReactNode
  xStep?: number
  yStep?: number
  label: string
  svgRef?: Ref<SVGSVGElement>
}

/** P1 — the plotting surface. Grid, axes, ticks; everything else is a child. */
export function Plot({ vp, children, xStep = 1, yStep = 1, label, svgRef }: Props) {
  const [x0, y0] = toPx(vp, 0, 0)
  const showX = vp.yMin < 0 && vp.yMax > 0
  const showY = vp.xMin < 0 && vp.xMax > 0

  return (
    <svg
      ref={svgRef}
      className="plot"
      viewBox={`0 0 ${BOX.w} ${BOX.h}`}
      role="img"
      aria-label={label}
    >
      <defs>
        <clipPath id="plot-clip">
          <rect x="0" y="0" width={BOX.w} height={BOX.h} rx="14" />
        </clipPath>
      </defs>

      <g clipPath="url(#plot-clip)">
        <g className="plot-grid">
          {ticks(vp.xMin, vp.xMax, xStep).map((x) => (
            <line key={`gx${x}`} x1={toPx(vp, x, 0)[0]} y1={0} x2={toPx(vp, x, 0)[0]} y2={BOX.h} />
          ))}
          {ticks(vp.yMin, vp.yMax, yStep).map((y) => (
            <line key={`gy${y}`} x1={0} y1={toPx(vp, 0, y)[1]} x2={BOX.w} y2={toPx(vp, 0, y)[1]} />
          ))}
        </g>

        {showX && <line className="plot-axis" x1={0} y1={y0} x2={BOX.w} y2={y0} />}
        {showY && <line className="plot-axis" x1={x0} y1={0} x2={x0} y2={BOX.h} />}

        {children}

        {showX &&
          ticks(vp.xMin + xStep, vp.xMax - xStep * 0.5, xStep * 2).map((x) =>
            x === 0 ? null : (
              <text key={`tx${x}`} className="plot-tick" x={toPx(vp, x, 0)[0]} y={y0 + 24}
                textAnchor="middle" stroke="var(--bg-sunk)" strokeWidth="4"
                paintOrder="stroke" strokeLinejoin="round">
                {x}
              </text>
            ),
          )}
      </g>
    </svg>
  )
}

type CurveProps = { vp: Viewport; f: (x: number) => number; ghost?: boolean }

/** Samples f across the viewport and draws it. Segments break across discontinuities. */
export function Curve({ vp, f, ghost = false }: CurveProps) {
  const N = 240
  const pad = (vp.yMax - vp.yMin) * 3
  let d = ""
  let pen = false

  for (let i = 0; i <= N; i++) {
    const x = vp.xMin + ((vp.xMax - vp.xMin) * i) / N
    const y = f(x)
    if (!Number.isFinite(y) || y > vp.yMax + pad || y < vp.yMin - pad) {
      pen = false
      continue
    }
    const [px, py] = toPx(vp, x, y)
    d += `${pen ? "L" : "M"}${px.toFixed(2)} ${py.toFixed(2)} `
    pen = true
  }

  return <path className={ghost ? "plot-curve-ghost" : "plot-curve"} d={d} />
}

export function Dot({
  vp,
  x,
  y,
  kind = "root",
}: {
  vp: Viewport
  x: number
  y: number
  kind?: "root" | "vertex"
}) {
  const [px, py] = toPx(vp, x, y)
  return <circle className={kind === "root" ? "plot-root" : "plot-vertex"} cx={px} cy={py} r={8} />
}
