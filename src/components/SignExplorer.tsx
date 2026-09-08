import { roots, type Coeffs, evalQuadratic, trim } from "../lib/quadratic"

/**
 * P5 — where an expression is positive, zero or negative.
 * Critical values partition the line; each region gets one sign.
 */
export function SignExplorer({ q, xMin = -8, xMax = 8 }: { q: Coeffs; xMin?: number; xMax?: number }) {
  const W = 640
  const H = 120
  const y = 62
  const px = (x: number) => 40 + ((x - xMin) / (xMax - xMin)) * (W - 80)

  const crit = roots(q).filter((r) => r > xMin && r < xMax).sort((a, b) => a - b)
  const edges = [xMin, ...crit, xMax]

  const bands = edges.slice(0, -1).map((lo, i) => {
    const hi = edges[i + 1]
    const sign = evalQuadratic(q, (lo + hi) / 2) >= 0 ? 1 : -1
    return { lo, hi, sign }
  })

  return (
    <svg className="sign" viewBox={`0 0 ${W} ${H}`} role="img"
      aria-label="Sign of the expression across the number line">
      {bands.map((b, i) => (
        <rect
          key={i}
          className={b.sign > 0 ? "sign-pos" : "sign-neg"}
          x={px(b.lo)}
          y={y - 5}
          width={Math.max(0, px(b.hi) - px(b.lo))}
          height={10}
          rx="5"
        />
      ))}

      <line className="sign-line" x1={40} y1={y} x2={W - 40} y2={y} opacity={0.25} />

      {bands.map((b, i) => (
        <text key={`s${i}`} className="sign-sym" x={(px(b.lo) + px(b.hi)) / 2} y={y - 20}
          textAnchor="middle" fill={b.sign > 0 ? "var(--accent)" : "var(--accent-2)"}>
          {b.sign > 0 ? "+" : "−"}
        </text>
      ))}

      {crit.map((r) => (
        <g key={r}>
          <circle className="sign-crit" cx={px(r)} cy={y} r={6} />
          <text className="sign-lab" x={px(r)} y={y + 30} textAnchor="middle">{trim(r)}</text>
        </g>
      ))}

      {crit.length === 0 && (
        <text className="sign-lab" x={W / 2} y={y + 32} textAnchor="middle">
          no crossings — one sign everywhere
        </text>
      )}
    </svg>
  )
}
