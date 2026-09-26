import puppeteer from 'puppeteer-core'
const B = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new', args: ['--no-sandbox'],
})
const [out, id, wArg] = process.argv.slice(2)
const width = Number(wArg || 1440)
const p = await B.newPage()
await p.setViewport({ width, height: 900, deviceScaleFactor: 1 })
await p.goto('http://localhost:5180/', { waitUntil: 'domcontentloaded' })
await p.evaluate(() => { history.scrollRestoration = 'manual'; window.scrollTo(0, 0) })
await new Promise((r) => setTimeout(r, 2500))
// Lenis snaps programmatic scrolls back, so drive it with the wheel.
for (let n = 0; n < 90; n++) {
  const done = await p.evaluate((s) => {
    const el = document.getElementById(s)
    return el.getBoundingClientRect().top < 40
  }, id)
  if (done) break
  await p.mouse.wheel({ deltaY: 260 })
  await new Promise((r) => setTimeout(r, 55))
}
await new Promise((r) => setTimeout(r, 2200))
const el = await p.$(`#${id}`)
await el.screenshot({ path: `${out}/sec-${id}-${width}.png` })
console.log(await p.evaluate((s) => {
  const el = document.getElementById(s)
  const r = el.getBoundingClientRect()
  return JSON.stringify({ h: Math.round(r.height), svgs: el.querySelectorAll('svg').length,
    docW: document.documentElement.scrollWidth, win: innerWidth })
}, id))
await B.close()
