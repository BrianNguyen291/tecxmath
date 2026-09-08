import { chromium } from "playwright"
const b = await chromium.launch()
const p = await (await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })).newPage()
await p.goto("https://briannguyen291.github.io/tecxmath/?cb=" + Date.now(), { waitUntil: "networkidle" })
await p.$$eval(".row:not([disabled])", r => r[0].click())
await p.waitForSelector(".beat")
const box = async (sel) => p.$eval(sel, n => { const r = n.getBoundingClientRect()
  const cs = getComputedStyle(n)
  return { top: Math.round(r.top), bottom: Math.round(r.bottom), h: Math.round(r.height),
           pos: cs.position, z: cs.zIndex, grid: cs.gridTemplateColumns, disp: cs.display } })
for (const s of [".lesson", ".stage", ".controls", ".beats", ".beat"]) {
  try { console.log(s.padEnd(11), JSON.stringify(await box(s))) } catch { console.log(s, "MISSING") }
}
const overlap = await p.evaluate(() => {
  const c = document.querySelector(".controls").getBoundingClientRect()
  const t = document.querySelector(".beats").getBoundingClientRect()
  return { controlsBottom: Math.round(c.bottom), beatsTop: Math.round(t.top),
           overlapPx: Math.round(c.bottom - t.top) }
})
console.log("OVERLAP:", JSON.stringify(overlap))
await p.screenshot({ path: "/tmp/claude-501/-Users-biran/432123e5-8140-42d3-9db2-ec08ec2a4e26/scratchpad/mob.png" })
await b.close()
