# Quadratics

Seven interactive lessons covering the quadratics content of Edexcel A-level Pure Year 1.
Prototype for the MVP described in the PRD.

```
pnpm install
pnpm dev      # http://localhost:5173
pnpm test     # equivalence-checker tests
pnpm build
```

## Shape

Lessons are **data**, not code. `src/lessons/*.tsx` each declare a stage (the thing you
manipulate) and a list of beats (the guided sequence). Adding a lesson is authoring.

Six primitives carry all seven lessons — the reuse thesis, made testable:

| | Primitive | File |
|---|---|---|
| P1 | Parameter plot | `components/Plot.tsx` |
| P2 | Draggable points | `components/DragPoint.tsx` |
| P3 | Area model | `components/AreaModel.tsx` |
| P4 | Step reveal | `components/Steps.tsx` |
| P5 | Sign explorer | `components/SignExplorer.tsx` |
| P6 | Answer check | `lib/expr.ts`, `components/Check.tsx` |

## The answer checker

`lib/expr.ts` decides algebraic equivalence by **sampling**, not symbolic rearrangement:
two expressions match if they agree numerically at many points. `2(x+3)` matches `2x+6`
without a CAS, and it generalises to any form a student types. No dependencies.

## Deviations from the PRD

- **Vite, not Next.js.** No SSR need; simpler and faster for a static client-side app.
- **Hand-rolled SVG, not Mafs.** The lessons need fixed viewports, not pan/zoom, and the
  visual bar wanted full control. The escape hatch the PRD anticipated, taken up front.
