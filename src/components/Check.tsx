import { useRef, useState } from "react"
import { track } from "../lib/track"
import { useWhere } from "./Lesson"
import { equivalent, shape } from "../lib/expr"
import { Tex } from "./Tex"

const Tick = () => (
  <svg className="opt-mark" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path d="M4 10.5l4 4 8-9" stroke="currentColor" strokeWidth="2.2"
      strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const Cross = () => (
  <svg className="opt-mark" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path d="M5.5 5.5l9 9M14.5 5.5l-9 9" stroke="currentColor" strokeWidth="2.2"
      strokeLinecap="round" />
  </svg>
)

export type Option = { label: string; tex?: boolean; correct?: boolean; why?: string }

/** Multiple choice. Wrong answers carry their own targeted response. */
export function Choice({
  question,
  options,
  onSolved,
}: {
  question: string
  options: Option[]
  onSolved: () => void
}) {
  const [picked, setPicked] = useState<number | null>(null)
  const tries = useRef(0)
  const where = useWhere()
  const chosen = picked === null ? null : options[picked]

  const pick = (i: number) => {
    if (chosen?.correct) return
    setPicked(i)
    tries.current += 1
    track("check_attempt", where.lesson, {
      beat: where.beat, correct: !!options[i].correct, attempt: tries.current,
      detail: options[i].label,
    })
    if (options[i].correct) onSolved()
  }

  return (
    <div className="ex">
      <p className="ex-q">{question}</p>
      {options.map((o, i) => {
        const on = picked === i
        return (
          <button
            key={o.label}
            className={`opt ${on ? (o.correct ? "right" : "wrong") : ""}`}
            onClick={() => pick(i)}
            disabled={chosen?.correct === true}
          >
            {on && o.correct ? <Tick /> : on ? <Cross /> : <span className="opt-mark" />}
            <span>{o.tex ? <Tex>{o.label}</Tex> : o.label}</span>
          </button>
        )
      })}
      <p role="status" aria-live="polite" className={chosen ? `feedback ${chosen.correct ? "ok" : "no"}` : "feedback-slot"}>
        {chosen && (chosen.why ?? (chosen.correct ? "That's it." : "Not quite — try another."))}
      </p>
    </div>
  )
}

/** Free expression entry, checked by numeric equivalence rather than string match. */
export function Entry({
  question,
  answer,
  placeholder = "type your answer",
  misread,
  requireShape,
  onSolved,
}: {
  question: string
  answer: string
  placeholder?: string
  /** For "write it in the form ..." questions. The answer must be equivalent AND
   *  match this shape — otherwise typing the question back passes, since the two
   *  are the same function. Signatures come from shape() in lib/expr. */
  requireShape?: { test: RegExp; why: string }
  /** Wrong-but-expected answers, each with a response naming the misconception. */
  misread?: { expr: string; why: string }[]
  onSolved: () => void
}) {
  const [text, setText] = useState("")
  const [state, setState] = useState<null | { ok: boolean; msg: string }>(null)
  const tries = useRef(0)
  const where = useWhere()

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (state?.ok) return
    if (!text.trim()) return

    tries.current += 1
    const sameValue = equivalent(text, answer)
    const sig = shape(text)
    const wrongForm = sameValue && requireShape != null && !(sig && requireShape.test.test(sig))
    const ok = sameValue && !wrongForm
    track("check_attempt", where.lesson, {
      beat: where.beat, correct: ok, attempt: tries.current, detail: text.slice(0, 40),
    })
    if (ok) {
      setState({ ok: true, msg: "That's it." })
      onSolved()
      return
    }
    if (wrongForm && requireShape) {
      setState({ ok: false, msg: requireShape.why })
      return
    }
    const hit = misread?.find((m) => equivalent(text, m.expr))
    setState({ ok: false, msg: hit ? hit.why : "Not equivalent. Try again." })
  }

  return (
    <form className="ex" onSubmit={submit}>
      <p className="ex-q">{question}</p>
      <div className="entry">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          aria-label={question}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          disabled={state?.ok}
        />
        {!state?.ok && <button className="btn" type="submit">Check</button>}
      </div>
      <p role="status" aria-live="polite" className={state ? `feedback ${state.ok ? "ok" : "no"}` : "feedback-slot"}>
        {state?.msg}
      </p>
    </form>
  )
}
