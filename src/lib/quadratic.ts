export type Coeffs = { a: number; b: number; c: number }

export const evalQuadratic = ({ a, b, c }: Coeffs, x: number) => a * x * x + b * x + c

export const discriminant = ({ a, b, c }: Coeffs) => b * b - 4 * a * c

export const roots = (q: Coeffs): number[] => {
  const { a, b } = q
  if (Math.abs(a) < 1e-9) return Math.abs(b) < 1e-9 ? [] : [-q.c / b]
  const d = discriminant(q)
  if (d < -1e-9) return []
  if (d <= 1e-9) return [-b / (2 * a)]
  const r = Math.sqrt(d)
  return [(-b - r) / (2 * a), (-b + r) / (2 * a)].sort((m, n) => m - n)
}

export const vertex = ({ a, b, c }: Coeffs): [number, number] => {
  if (Math.abs(a) < 1e-9) return [0, c]
  const x = -b / (2 * a)
  return [x, evalQuadratic({ a, b, c }, x)]
}

/** Format a signed term for display, e.g. (2, "x") -> "+ 2x", (-1, "x") -> "- x" */
export const term = (v: number, sym: string): string => {
  const n = Number(v.toFixed(2))
  if (n === 0) return ""
  const sign = n < 0 ? "-" : "+"
  const mag = Math.abs(n)
  const num = mag === 1 && sym ? "" : trim(mag)
  return ` ${sign} ${num}${sym}`
}

export const trim = (v: number): string => {
  const n = Number(v.toFixed(2))
  return Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/0$/, "")
}

/** LaTeX for y = ax² + bx + c, omitting zero terms. */
export const quadraticTex = ({ a, b, c }: Coeffs): string => {
  if (Number(a.toFixed(2)) === 0 && Number(b.toFixed(2)) === 0) return `y = ${trim(c)}`
  const lead =
    Number(a.toFixed(2)) === 0
      ? ""
      : a === 1
        ? "x^2"
        : a === -1
          ? "-x^2"
          : `${trim(a)}x^2`
  const rest = `${term(b, "x")}${term(c, "")}`
  return `y = ${lead}${rest}`.replace("= +", "=").replace(/\s+/g, " ")
}
