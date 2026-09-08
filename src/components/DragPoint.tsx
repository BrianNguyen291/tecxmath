import { useCallback, useRef } from "react"
import { BOX, type Viewport, clamp, eventToSvg, snap, toMath, toPx } from "../lib/coords"

type Props = {
  vp: Viewport
  x: number
  y: number
  /** Called with the new maths coordinates while dragging. */
  onMove: (x: number, y: number) => void
  /** Restrict movement to one axis. */
  axis?: "x" | "y" | "both"
  range?: [number, number]
  step?: number
  label: string
}

/**
 * P2 — a draggable handle. Pointer-driven, and fully keyboard-operable:
 * arrows nudge by one step, shift+arrow by five.
 */
export function DragPoint({
  vp,
  x,
  y,
  onMove,
  axis = "both",
  range,
  step = 0.1,
  label,
}: Props) {
  const ref = useRef<SVGGElement>(null)
  const [px, py] = toPx(vp, x, y)
  const lo = range?.[0] ?? (axis === "y" ? vp.yMin : vp.xMin)
  const hi = range?.[1] ?? (axis === "y" ? vp.yMax : vp.xMax)
  const now = Number((axis === "y" ? y : x).toFixed(2))

  const apply = useCallback(
    (nx: number, ny: number) => {
      const lo = range?.[0] ?? vp.xMin
      const hi = range?.[1] ?? vp.xMax
      onMove(
        axis === "y" ? x : clamp(snap(nx, step), lo, hi),
        axis === "x" ? y : clamp(snap(ny, step), vp.yMin, vp.yMax),
      )
    },
    [axis, onMove, range, step, vp, x, y],
  )

  const onPointerDown = (e: React.PointerEvent<SVGGElement>) => {
    const svg = ref.current?.ownerSVGElement
    if (!svg) return
    e.currentTarget.setPointerCapture(e.pointerId)

    const move = (ev: PointerEvent) => {
      const [sx, sy] = eventToSvg(svg, ev)
      apply(...toMath(vp, clamp(sx, 0, BOX.w), clamp(sy, 0, BOX.h)))
    }
    const up = () => {
      window.removeEventListener("pointermove", move)
      window.removeEventListener("pointerup", up)
    }
    window.addEventListener("pointermove", move)
    window.addEventListener("pointerup", up)
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    const d = (e.shiftKey ? 5 : 1) * step
    const map: Record<string, [number, number]> = {
      ArrowLeft: [-d, 0],
      ArrowRight: [d, 0],
      ArrowUp: [0, d],
      ArrowDown: [0, -d],
    }
    const delta = map[e.key]
    if (!delta) return
    e.preventDefault()
    apply(x + delta[0], y + delta[1])
  }

  return (
    <g
      ref={ref}
      className="drag"
      tabIndex={0}
      role="slider"
      aria-label={label}
      aria-orientation={axis === "y" ? "vertical" : "horizontal"}
      aria-valuemin={lo}
      aria-valuemax={hi}
      aria-valuenow={now}
      aria-valuetext={`${axis === "y" ? "y" : "x"} = ${now}`}
      onPointerDown={onPointerDown}
      onKeyDown={onKeyDown}
    >
      <circle className="drag-halo" cx={px} cy={py} r={22} opacity={0.18} />
      <circle className="drag-hit" cx={px} cy={py} r={26} />
      <circle className="drag-ring" cx={px} cy={py} r={11} />
    </g>
  )
}
