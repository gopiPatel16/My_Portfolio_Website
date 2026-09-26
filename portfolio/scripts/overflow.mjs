import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  defaultViewport: { width: 390, height: 844, deviceScaleFactor: 1 },
})
const p = await b.newPage()
await p.goto(process.argv[2] ?? 'http://localhost:5180/', { waitUntil: 'domcontentloaded' })
await new Promise(r => setTimeout(r, 1500))
const res = await p.evaluate(() => {
  const W = window.innerWidth
  const rows = []
  document.querySelectorAll('*').forEach(el => {
    const r = el.getBoundingClientRect()
    if (r.width === 0) return
    // Deepest elements that are themselves too wide.
    if (r.right > W + 1 || r.left < -1) {
      const kids = [...el.children].some(c => {
        const cr = c.getBoundingClientRect()
        return cr.right > W + 1 || cr.left < -1
      })
      if (!kids) rows.push({
        tag: el.tagName,
        cls: String(el.className).slice(0, 70),
        txt: (el.textContent || '').trim().slice(0, 40),
        left: Math.round(r.left), right: Math.round(r.right), w: Math.round(r.width),
      })
    }
  })
  return { W, docW: document.documentElement.scrollWidth, rows: rows.slice(0, 20) }
})
console.log(JSON.stringify(res, null, 1))
await b.close()
