import type { ReactNode } from "react"
import { Plot, Curve, Dot } from "../components/Plot"
import { Slider } from "../components/Slider"
import { Tex } from "../components/Tex"
import type { Viewport } from "../lib/coords"

export type LessonProps = {
  onBack: () => void
  onNext?: () => void
  onComplete?: () => void
}

export const VP: Viewport = { xMin: -8, xMax: 8, yMin: -3, yMax: 7 }

export function Readout({ tex, note }: { tex: string; note?: ReactNode }) {
  return (
    <div className="readout">
      <span className="readout-main"><Tex>{tex}</Tex></span>
      {note && <span className="readout-note">{note}</span>}
    </div>
  )
}

export { Plot, Curve, Dot, Slider, Tex }
