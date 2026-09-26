import puppeteer from 'puppeteer-core'
const B = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new', args: ['--no-sandbox'],
})
const p = await B.newPage()
await p.setViewport({ width: Number(process.argv[3] || 1440), height: 900 })
await p.goto('http://localhost:5180/', { waitUntil: 'domcontentloaded' })
await p.evaluate(() => { history.scrollRestoration = 'manual'; scrollTo(0, 0) })
await new Promise((r) => setTimeout(r, 2200))
for (let n = 0; n < 90; n++) {
  if (await p.evaluate(() => document.getElementById('toolkit').getBoundingClientRect().top < 40)) break
  await p.mouse.wheel({ deltaY: 260 })
  await new Promise((r) => setTimeout(r, 55))
}
await new Promise((r) => setTimeout(r, 2000))
// Text boxes first, then hide the content so only the pattern remains.
const boxes = await p.evaluate(() => {
  const sec = document.getElementById('toolkit')
  const base = sec.getBoundingClientRect()
  return [...sec.querySelectorAll('p, h2, [role="tab"]')]
    .filter((el) => (el.textContent || '').trim() && !el.closest('.panel'))
    .map((el) => {
      const r = el.getBoundingClientRect()
      return { t: (el.textContent || '').trim().slice(0, 28), color: getComputedStyle(el).color, bg: getComputedStyle(el).backgroundColor,
        x: Math.round(r.left), y: Math.round(r.top - base.top),
        w: Math.round(r.width), h: Math.round(r.height) }
    })
})
// The fixed nav can sit over the heading at this scroll position; hide it too so it is not measured as background.
await p.evaluate(() => { document.querySelector('#toolkit .shell').style.visibility = 'hidden'; document.querySelector('header').style.visibility = 'hidden' })
await new Promise((r) => setTimeout(r, 300))
await (await p.$('#toolkit')).screenshot({ path: `${process.argv[2]}/pattern-only.png` })
console.log(JSON.stringify(boxes))
await B.close()
