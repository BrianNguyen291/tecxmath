/**
 * A small, dependency-free expression parser.
 *
 * Equivalence is decided by *sampling*, not by symbolic rearrangement: two
 * expressions are equal if they agree numerically at many points. That makes
 * `2(x+3)` and `2x+6` match without needing a CAS, and it generalises to every
 * form a student might type.
 */

type Node =
  | { k: "num"; v: number }
  | { k: "var" }
  | { k: "bin"; op: string; l: Node; r: Node }
  | { k: "neg"; e: Node }
  | { k: "fn"; name: string; a: Node }

type Tok = { t: "num" | "id" | "op" | "(" | ")"; v: string }

const FNS: Record<string, (n: number) => number> = {
  sqrt: Math.sqrt,
  abs: Math.abs,
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  ln: Math.log,
  log: Math.log10,
  exp: Math.exp,
}

const PREC: Record<string, number> = { "+": 1, "-": 1, "*": 2, "/": 2, "^": 4 }

function tokenize(src: string): Tok[] {
  const s = src.replace(/\s+/g, "").replace(/−/g, "-").replace(/[×·]/g, "*").replace(/÷/g, "/")
  const out: Tok[] = []
  let i = 0

  while (i < s.length) {
    const c = s[i]
    if (/[0-9.]/.test(c)) {
      let j = i
      while (j < s.length && /[0-9.]/.test(s[j])) j++
      out.push({ t: "num", v: s.slice(i, j) })
      i = j
    } else if (/[a-zA-Z]/.test(c)) {
      let j = i
      while (j < s.length && /[a-zA-Z]/.test(s[j])) j++
      out.push({ t: "id", v: s.slice(i, j) })
      i = j
    } else if ("+-*/^".includes(c)) {
      out.push({ t: "op", v: c })
      i++
    } else if (c === "(" || c === "[") {
      out.push({ t: "(", v: "(" })
      i++
    } else if (c === ")" || c === "]") {
      out.push({ t: ")", v: ")" })
      i++
    } else {
      throw new Error(`Unexpected character "${c}"`)
    }
  }
  return insertImplicitMultiply(out)
}

/** 2x, 3(x+1), (x+1)(x-1) and x(x+2) all mean multiplication. */
function insertImplicitMultiply(toks: Tok[]): Tok[] {
  const out: Tok[] = []
  for (let i = 0; i < toks.length; i++) {
    const cur = toks[i]
    const prev = out[out.length - 1]
    if (prev) {
      const prevEnds = prev.t === "num" || prev.t === ")" || (prev.t === "id" && !FNS[prev.v])
      const curStarts = cur.t === "num" || cur.t === "id" || cur.t === "("
      if (prevEnds && curStarts) out.push({ t: "op", v: "*" })
    }
    out.push(cur)
  }
  return out
}

function parse(toks: Tok[]): Node {
  let p = 0
  const peek = () => toks[p]
  const eat = () => toks[p++]

  function atom(): Node {
    const t = eat()
    if (!t) throw new Error("Unexpected end of expression")

    if (t.t === "num") {
      const v = Number(t.v)
      if (!Number.isFinite(v)) throw new Error(`Bad number "${t.v}"`)
      return { k: "num", v }
    }
    if (t.t === "op" && t.v === "-") return { k: "neg", e: unary() }
    if (t.t === "op" && t.v === "+") return unary()
    if (t.t === "(") {
      const e = expr(0)
      if (peek()?.t !== ")") throw new Error("Missing closing bracket")
      eat()
      return e
    }
    if (t.t === "id") {
      const name = t.v.toLowerCase()
      if (FNS[name]) {
        if (peek()?.t !== "(") throw new Error(`${name} needs brackets`)
        eat()
        const a = expr(0)
        if (peek()?.t !== ")") throw new Error("Missing closing bracket")
        eat()
        return { k: "fn", name, a }
      }
      if (name === "pi") return { k: "num", v: Math.PI }
      if (name === "e") return { k: "num", v: Math.E }
      if (name === "x") return { k: "var" }
      throw new Error(`Unknown symbol "${t.v}"`)
    }
    throw new Error("Unexpected token")
  }

  /** Exponent binds tighter than unary minus on its left: -x^2 is -(x^2). */
  function unary(): Node {
    const base = atom()
    if (peek()?.t === "op" && peek().v === "^") {
      eat()
      return { k: "bin", op: "^", l: base, r: unary() }
    }
    return base
  }

  function expr(min: number): Node {
    let left = unary()
    for (;;) {
      const t = peek()
      if (!t || t.t !== "op") break
      const prec = PREC[t.v]
      if (prec === undefined || prec < min) break
      eat()
      const right = expr(t.v === "^" ? prec : prec + 1)
      left = { k: "bin", op: t.v, l: left, r: right }
    }
    return left
  }

  const out = expr(0)
  if (p < toks.length) throw new Error("Unexpected trailing input")
  return out
}

function evalNode(n: Node, x: number): number {
  switch (n.k) {
    case "num": return n.v
    case "var": return x
    case "neg": return -evalNode(n.e, x)
    case "fn": return FNS[n.name](evalNode(n.a, x))
    case "bin": {
      const l = evalNode(n.l, x)
      const r = evalNode(n.r, x)
      switch (n.op) {
        case "+": return l + r
        case "-": return l - r
        case "*": return l * r
        case "/": return l / r
        case "^": return Math.pow(l, r)
      }
      return NaN
    }
  }
}

const OPNAME: Record<string, string> = {
  "+": "add", "-": "sub", "*": "mul", "/": "div", "^": "pow",
}

function sig(n: Node): string {
  switch (n.k) {
    case "num": return "num"
    case "var": return "var"
    case "neg": return `neg(${sig(n.e)})`
    case "fn": return `${n.name}(${sig(n.a)})`
    case "bin": return `${OPNAME[n.op] ?? n.op}(${sig(n.l)},${sig(n.r)})`
  }
}

/**
 * A structural signature for an expression, e.g.
 *   "(x+4)^2-16" -> "sub(pow(add(var,num),num),num)"
 *   "x^2+8x"     -> "add(pow(var,num),mul(num,var))"
 *
 * Equivalence by sampling cannot tell these apart — they are the same function.
 * A "write it in completed square form" question is asking about shape, not value,
 * so it needs this instead. Returns null if the input does not parse.
 */
export function shape(src: string): string | null {
  try {
    return sig(parse(tokenize(src)))
  } catch {
    return null
  }
}

export type Compiled = (x: number) => number

/** Throws with a human-readable message if the input is not a valid expression. */
export function compile(src: string): Compiled {
  if (!src.trim()) throw new Error("Nothing entered")
  const ast = parse(tokenize(src))
  return (x: number) => evalNode(ast, x)
}

/** Deterministic, irrational-ish sample points — avoids accidental agreement. */
const SAMPLES = [
  -2.713, -2.117, -1.618, -1.202, -0.739, -0.317, 0.211, 0.618,
  1.104, 1.414, 1.913, 2.236, 2.718, 3.141, -3.302, 0.874,
]

/** True when two expressions agree numerically wherever both are defined. */
export function equivalent(a: string, b: string): boolean {
  let fa: Compiled
  let fb: Compiled
  try {
    fa = compile(a)
    fb = compile(b)
  } catch {
    return false
  }

  let checked = 0
  for (const x of SAMPLES) {
    const va = fa(x)
    const vb = fb(x)
    if (!Number.isFinite(va) || !Number.isFinite(vb)) continue
    const scale = Math.max(1, Math.abs(va), Math.abs(vb))
    if (Math.abs(va - vb) > 1e-6 * scale) return false
    checked++
  }
  return checked >= 6
}
