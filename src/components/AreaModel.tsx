import { trim } from "../lib/quadratic"

/**
 * P3 — completing the square, drawn as a literal square.
 *
 * x² is the big square; bx splits into two strips of width b/2; the notch that
 * remains is exactly (b/2)². That notch is the term you add and subtract.
 */
export function AreaModel({ b, showGap }: { b: number; showGap: boolean }) {
  const W = 640
  const H = 400
  const unit = 210 // pixels representing "x"
  const half = (Math.abs(b) / 2) * 34 // pixels representing b/2
  const ox = 90
  const oy = 40

  return (
    <svg className="plot" viewBox={`0 0 ${W} ${H}`} role="img"
      aria-label={`Area model for x squared plus ${trim(b)} x`}>
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

      {/* the notch */}
      {showGap && half > 4 && (
        <>
          <rect className="area-gap" x={ox + unit} y={oy + unit} width={half} height={half} rx="3" />
          <text className="area-lab-hi" x={ox + unit + half + 16} y={oy + unit + half / 2 + 6}>
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
