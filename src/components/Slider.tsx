import { Tex } from "./Tex"
import { trim } from "../lib/quadratic"

type Props = {
  sym: string
  value: number
  onChange: (v: number) => void
  min: number
  max: number
  step?: number
}

/** A labelled parameter control. Native range input, so keyboard support is free. */
export function Slider({ sym, value, onChange, min, max, step = 0.1 }: Props) {
  return (
    <label className="ctl">
      <span className="ctl-label">
        <Tex>{sym}</Tex>
        <span className="ctl-val">{trim(value)}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-label={sym}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  )
}
