import puppeteer from 'puppeteer-core'
const B = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new', args: ['--no-sandbox'],
})
const out = process.argv[2]
const W = Number(process.argv[3] || 1004), H = Number(process.argv[4] || 646)
const p = await B.newPage()
await p.setViewport({ width: W, height: H })
await p.goto('http://localhost:5180/', { waitUntil: 'domcontentloaded' })
await new Promise((r) => setTimeout(r, 2600))
// Reveal everything, then come back to the top, so each section is painted.
for (let n = 0; n < 200; n++) {
  const done = await p.evaluate(() => scrollY + innerHeight >= document.documentElement.scrollHeight - 4)
  if (done) break
  await p.mouse.wheel({ deltaY: 600 })
  await new Promise((r) => setTimeout(r, 40))
}
await new Promise((r) => setTimeout(r, 1200))
for (const id of ['home', 'work', 'toolkit', 'research']) {
  for (let n = 0; n < 260; n++) {
    const top = await p.evaluate((s) => document.getElementById(s).getBoundingClientRect().top, id)
    if (Math.abs(top) < 30) break
    await p.mouse.wheel({ deltaY: top > 0 ? Math.min(600, top) : Math.max(-600, top) })
    await new Promise((r) => setTimeout(r, 35))
  }
  await new Promise((r) => setTimeout(r, 900))
  await p.screenshot({ path: `${out}/short-${id}-${W}x${H}.png` })
}
console.log(JSON.stringify(await p.evaluate(() => {
  const px = (el) => el && Math.round(parseFloat(getComputedStyle(el).fontSize))
  return {
    win: [innerWidth, innerHeight],
    heroName: px(document.querySelector('#home h1 span[aria-hidden]')),
    heroSubtitle: px(document.querySelector('#home p[aria-hidden]')),
    sectionTitles: [...document.querySelectorAll('main h2')].map(px),
  }
})))
await B.close()
