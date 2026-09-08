import katex from "katex"
import { useMemo } from "react"

type Props = { children: string; block?: boolean; className?: string }

/** Renders a LaTeX string. Never throws on bad input — shows the source instead. */
export function Tex({ children, block = false, className }: Props) {
  const html = useMemo(
    () =>
      katex.renderToString(children, {
        displayMode: block,
        throwOnError: false,
        strict: false,
      }),
    [children, block],
  )
  return (
    <span
      className={className}
      style={block ? { display: "block", textAlign: "center" } : undefined}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
