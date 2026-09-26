import puppeteer from 'puppeteer-core'
const out = process.argv[2]
const B = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--no-sandbox'] })
const p = await B.newPage()
await p.setViewport({ width: 1234, height: 800 })
await p.goto('http://localhost:5180/', { waitUntil: 'domcontentloaded' })
await new Promise((r) => setTimeout(r, 2200))
for (let n = 0; n < 300; n++) {
  const top = await p.evaluate(() => document.getElementById('work').getBoundingClientRect().top)
  if (Math.abs(top - 60) < 30) break
  const d = top - 60
  await p.mouse.wheel({ deltaY: d > 0 ? Math.min(500, d) : Math.max(-500, d) }); await new Promise((r) => setTimeout(r, 40))
}
await new Promise((r) => setTimeout(r, 1500))
console.log(JSON.stringify(await p.evaluate(() => {
  const cards = [...document.querySelectorAll('#work article')]
  return {
    cornerArrowsLeft: document.querySelectorAll('#work a[aria-label*="case study"]').length,
    cards: cards.map((c) => {
      const name = c.querySelector('h3')?.textContent
      const overlay = [...c.querySelectorAll('a')].find((a) => a.getAttribute('aria-label')?.startsWith('Open the live'))
      const r = overlay?.getBoundingClientRect(); const thumb = c.querySelector('div.relative')?.getBoundingClientRect()
      return { name, live: overlay?.getAttribute('href') || null, target: overlay?.getAttribute('target') || null,
        coversThumb: !!r && !!thumb && Math.abs(r.width - thumb.width) < 2 && Math.abs(r.height - thumb.height) < 2 }
    }),
  }
}), null, 1))
// Clicking the thumbnail opens the site in a new tab.
const before = (await B.pages()).length
await p.evaluate(() => [...document.querySelectorAll('#work article')].find((c) => c.textContent.includes('GAMEVERSE')).querySelector('a[aria-label^="Open the live"]').click())
await new Promise((r) => setTimeout(r, 3500))
const pages = await B.pages()
console.log('new tab opened:', pages.length > before, '| url:', pages.length > before ? pages[pages.length - 1].url() : '-')
await p.screenshot({ path: `${out}/card-links.png` })
await B.close()
