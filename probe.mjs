import { chromium } from "playwright"
const U = "https://briannguyen291.github.io/tecxmath/?cb=" + process.argv[2]
const b = await chromium.launch(); const out = []
const open = async () => { const p = await (await b.newContext({viewport:{width:1280,height:900}})).newPage()
  await p.goto(U, { waitUntil: "networkidle" }); return p }
{
  const p = await open()
  await p.$$eval(".row:not([disabled])", r => r[0].click())
  await p.click(".beats > .btn"); await p.waitForTimeout(250)
  const btn = await p.$eval(".beats > .btn", n => ({ disabled: n.disabled, aria: n.getAttribute("aria-disabled"), cls: n.className }))
  out.push(`continue when locked: ${JSON.stringify(btn)} -> focusable=${!btn.disabled}`)
  out.push(`live regions: ${await p.$$eval("[role=status]", n => n.length)}`)
  await p.context().close()
}
{
  const p = await open()
  await p.$$eval(".row:not([disabled])", r => r[5].click())
  await p.waitForSelector("svg.sign")
  const before = await p.$eval("svg.sign", n => n.getAttribute("aria-label"))
  const s = await p.$('input[type="range"][aria-label="a"]'); await s.focus()
  for (let i=0;i<6;i++) await p.keyboard.press("ArrowLeft")
  await p.waitForTimeout(300)
  const after = await p.$eval("svg.sign", n => n.getAttribute("aria-label"))
  out.push(`sign label changes: ${before !== after}`)
  out.push(`  now: "${after.slice(0,88)}"`)
  await p.context().close()
}
{
  const p = await open()
  await p.$$eval(".row:not([disabled])", r => r[1].click())
  await p.click(".beats > .btn"); await p.waitForTimeout(250)
  await p.click("text=Show me the piece"); await p.waitForTimeout(250)
  const s = await p.$('input[type="range"][aria-label="b"]'); await s.focus()
  for (let i=0;i<6;i++) await p.keyboard.press("ArrowRight")   // b -> 12
  await p.waitForTimeout(300)
  const fits = await p.$$eval("rect", ns => ns.every(r => {
    const y = +r.getAttribute("y") || 0, h = +r.getAttribute("height") || 0
    return y + h <= 400 }))
  out.push(`areamodel fits viewBox at b=12: ${fits}`)
  await p.context().close()
}
await b.close(); console.log(out.join("\n"))
