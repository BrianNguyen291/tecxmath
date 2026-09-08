export type Viewport = {
  xMin: number
  xMax: number
  yMin: number
  yMax: number
}

/** Logical drawing surface. All plots draw into this box, then scale via viewBox. */
export const BOX = { w: 640, h: 400 } as const

export const toPx = (vp: Viewport, x: number, y: number): [number, number] => [
  ((x - vp.xMin) / (vp.xMax - vp.xMin)) * BOX.w,
  BOX.h - ((y - vp.yMin) / (vp.yMax - vp.yMin)) * BOX.h,
]

export const toMath = (vp: Viewport, px: number, py: number): [number, number] => [
  vp.xMin + (px / BOX.w) * (vp.xMax - vp.xMin),
  vp.yMin + ((BOX.h - py) / BOX.h) * (vp.yMax - vp.yMin),
]

/** Convert a pointer event to logical SVG coordinates, honouring any CSS scaling. */
export const eventToSvg = (
  svg: SVGSVGElement,
  e: { clientX: number; clientY: number },
): [number, number] => {
  const ctm = svg.getScreenCTM()
  if (!ctm) return [0, 0]
  const pt = svg.createSVGPoint()
  pt.x = e.clientX
  pt.y = e.clientY
  const p = pt.matrixTransform(ctm.inverse())
  return [p.x, p.y]
}

/** Nice round tick positions covering [min, max]. */
export const ticks = (min: number, max: number, step: number): number[] => {
  const out: number[] = []
  const start = Math.ceil(min / step) * step
  for (let v = start; v <= max + 1e-9; v += step) {
    out.push(Math.abs(v) < 1e-9 ? 0 : Number(v.toFixed(6)))
  }
  return out
}

export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

/** Round to the nearest step — keeps dragged values tidy. */
export const snap = (v: number, step: number) => Number((Math.round(v / step) * step).toFixed(6))
