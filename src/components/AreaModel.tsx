import { useRef, useState } from "react"
import { trim } from "../lib/quadratic"
import { eventToSvg } from "../lib/coords"

/**
 * P3 — completing the square, drawn as a literal square.
 *
 * x² is the big square; bx splits into two strips of width b/2; the notch that
 * remains is exactly (b/2)². That notch is the term you add and subtract.
 */
export function AreaModel({
  b,
  showGap,
  onPlaced,
}: {
  b: number
  showGap: boolean
  /** Fires once the dragged square snaps into the corner. */
  onPlaced?: () => void
}) {
  const W = 640
  const H = 400
  // Scale to fit at every b: x is nominally 6 units, the strips are b/2 units,
  // and together they fill the available height. Previously fixed, so b >= 9 ran
  // the drag target off the bottom of the canvas.
  const ox = 90
  const oy = 40
  const X_UNITS = 6
  const scale = (H - oy - 24) / (X_UNITS + Math.abs(b) / 2)
  const unit = X_UNITS * scale
  const half = (Math.abs(b) / 2) * scale

  const svg = useRef<SVGSVGElement>(null)
  const home = { x: ox + unit + 90, y: oy + 40 }
  const target = { x: ox + unit, y: oy + unit }
  const [pos, setPos] = useState(home)
  const [snapped, setSnapped] = useState(false)

  const near = (p: { x: number; y: number }) =>
    Math.hypot(p.x - target.x, p.y - target.y) < 46

  const drag = (e: React.PointerEvent) => {
    if (snapped || !svg.current) return
    e.currentTarget.setPointerCapture(e.pointerId)
    const move = (ev: PointerEvent) => {
      const [x, y] = eventToSvg(svg.current!, ev)
      setPos({ x: x - half / 2, y: y - half / 2 })
    }
    const up = () => {
      window.removeEventListener("pointermove", move)
      window.removeEventListener("pointerup", up)
      setPos((p) => {
        if (near(p)) {
          setSnapped(true)
          onPlaced?.()
          return target
        }
        return home
      })
    }
    window.addEventListener("pointermove", move)
    window.addEventListener("pointerup", up)
  }

  const place = () => {
    if (snapped) return
    setPos(target)
    setSnapped(true)
    onPlaced?.()
  }

  return (
    <svg ref={svg} className="plot" viewBox={`0 0 ${W} ${H}`} role="img"
      aria-label={
        showGap
          ? `Area model: an x by x square, two strips each ${trim(Math.abs(b) / 2)} by x, and the missing corner of area ${trim((b / 2) ** 2)}.`
          : `Area model: an x by x square with two strips each ${trim(Math.abs(b) / 2)} by x. One corner is missing.`
      }>
      {/* x by x */}
      <rect className="area-sq" x={ox} y={oy} width={unit} height={unit} rx="3" />
      <text className="area-lab" x={ox + unit / 2} y={oy + unit / 2 + 7} textAnchor="middle">
        <tspan>x²</tspan>
      </text>

      {/* two strips, each (b/2) by x */}
      <rect className="area-rect" x={ox + unit} y={oy} width={half} height={unit} rx="3" />
      <rect className="area-rect" x={ox} y={oy + unit} width={unit} height={half} rx="3" />

      {half > 26 && (
        <>
          <text className="area-lab" x={ox + unit + half / 2} y={oy + unit / 2 + 6}
            textAnchor="middle" fontSize="15">
            {trim(Math.abs(b) / 2)}x
          </text>
          <text className="area-lab" x={ox + unit / 2} y={oy + unit + half / 2 + 6}
            textAnchor="middle" fontSize="15">
            {trim(Math.abs(b) / 2)}x
          </text>
        </>
      )}

      {/* the notch: an outline to aim at, and a square you drag into it */}
      {showGap && half > 4 && (
        <>
          <rect className="area-slot" x={target.x} y={target.y} width={half} height={half} rx="3" />
          <g
            className={snapped ? "area-piece placed" : "area-piece"}
            onPointerDown={drag}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), place())}
            tabIndex={0}
            role="button"
            aria-label={
              snapped ? "Corner square placed" : "Drag the corner square into the notch"
            }
          >
            <rect x={pos.x} y={pos.y} width={half} height={half} rx="3" />
          </g>
          <text className="area-lab-hi" x={target.x + half + 16} y={target.y + half / 2 + 6}>
            ({trim(Math.abs(b) / 2)})² = {trim((b / 2) ** 2)}
          </text>
        </>
      )}

      {/* side labels */}
      <text className="area-lab" x={ox - 16} y={oy + unit / 2 + 6} textAnchor="end">x</text>
      <text className="area-lab" x={ox + unit / 2} y={oy - 14} textAnchor="middle">x</text>
      {half > 26 && (
        <text className="area-lab" x={ox + unit + half / 2} y={oy - 14} textAnchor="middle"
          fontSize="15">{trim(Math.abs(b) / 2)}</text>
      )}
    </svg>
  )
}
