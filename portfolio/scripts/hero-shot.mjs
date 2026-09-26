import puppeteer from 'puppeteer-core'
const B = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new', args: ['--no-sandbox'],
})
const out = process.argv[2]
for (const [w, h, tag] of [[1920, 1080, 'wide'], [1440, 900, 'desktop'], [390, 844, 'mobile'], [1024, 768, 'tablet']]) {
  const p = await B.newPage()
  await p.setViewport({ width: w, height: h, deviceScaleFactor: 1 })
  await p.goto('http://localhost:5180/', { waitUntil: 'domcontentloaded' })
  await p.evaluate(() => { history.scrollRestoration = 'manual'; window.scrollTo(0, 0) })
  await new Promise((r) => setTimeout(r, 2600))
  await p.evaluate(() => window.scrollTo(0, 0))
  await new Promise((r) => setTimeout(r, 900))
  await p.screenshot({ path: `${out}/hero-${tag}.png` })
  const m = await p.evaluate(() => {
    const q = (t) => [...document.querySelectorAll('p,span,h1')].find((e) => e.textContent.trim().startsWith(t))
    const r = (e) => e ? { top: Math.round(e.getBoundingClientRect().top), bottom: Math.round(e.getBoundingClientRect().bottom) } : null
    return {
      name: r(document.querySelector('#home h1')),
      role: r(q('AI PROMPT ENGINEER')),
      scroll: r(q('SCROLL')),
      wordmarkInNav: !!document.querySelector('header nav a[href="/"]'),
      docW: document.documentElement.scrollWidth, win: innerWidth,
    }
  })
  console.log(tag, JSON.stringify(m))
  await p.close()
}
await B.close()
