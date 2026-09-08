import { chromium } from "playwright"
const U = "https://briannguyen291.github.io/tecxmath/"
const b = await chromium.launch(); const out = []
const open = async () => { const p = await (await b.newContext({viewport:{width:1280,height:900}})).newPage()
  await p.goto(U, { waitUntil: "networkidle" }); return p }

// form hole: L2 — navigate the real beat order, then type the question back
{
  const p = await open()
  await p.$$eval(".row:not([disabled])", r => r[1].click())
  await p.click(".beats > .btn")                       // -> beat 1 (gated on the drag)
  await p.waitForTimeout(250)
  await p.click("text=Show me the piece")
  await p.waitForTimeout(250)
  await p.focus(".area-piece"); await p.keyboard.press("Enter")
  await p.waitForTimeout(350)
  await p.click(".beats > .btn"); await p.waitForTimeout(250)   // -> beat 2 steps
  await p.click(".beats > .btn"); await p.waitForTimeout(250)   // -> beat 3 entry
  const inp = await p.$(".entry input")
  if (!inp) { out.push("form hole: entry unreachable") }
  else {
    await inp.fill("x^2+8x"); await p.click(".entry .btn"); await p.waitForTimeout(300)
    const msg = (await p.$$eval(".feedback", n => n[n.length-1].textContent)).trim()
    const gated = await p.$eval(".beats > .btn", x => x.disabled)
    out.push(`form hole: question-as-answer -> "${msg.slice(0,72)}" | stillGated=${gated}`)
    await inp.fill("(x+4)^2-16"); await p.click(".entry .btn"); await p.waitForTimeout(300)
    const ok = (await p.$$eval(".feedback", n => n[n.length-1].textContent)).trim()
    out.push(`  real answer -> "${ok.slice(0,40)}"`)
  }
  await p.context().close()
}
// a = 0 on lesson 5 (start a=1, step 0.5 -> two presses)
{
  const p = await open()
  await p.$$eval(".row:not([disabled])", r => r[4].click())
  const s = await p.$('input[type="range"][aria-label="a"]'); await s.focus()
  await p.keyboard.press("ArrowLeft"); await p.keyboard.press("ArrowLeft")
  await p.waitForTimeout(300)
  out.push(`a=0: readout="${(await p.textContent(".readout-main")).trim()}" verdict="${(await p.textContent(".readout-note")).trim()}"`)
  await p.context().close()
}
await b.close(); console.log(out.join("\n"))
