import puppeteer from 'puppeteer-core'
const B = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new', args: ['--no-sandbox'],
})
const p = await B.newPage()
await p.setViewport({ width: 1440, height: 900 })
const errs = []
p.on('pageerror', (e) => errs.push(String(e).slice(0, 200)))
p.on('console', (m) => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 200)) })
await p.goto('http://localhost:5180/', { waitUntil: 'domcontentloaded' })
await new Promise((r) => setTimeout(r, 3000))
console.log(JSON.stringify(await p.evaluate(() => {
  const main = document.querySelector('main')
  return {
    docH: document.documentElement.scrollHeight,
    mainChildren: [...(main?.children || [])].map((el) => {
      const r = el.getBoundingClientRect()
      return `${el.tagName}#${el.id || '-'} y=${Math.round(r.top + scrollY)} h=${Math.round(r.height)}`
    }),
    revealHidden: [...document.querySelectorAll('main *')].filter((el) => {
      const s = getComputedStyle(el)
      return Number(s.opacity) < 0.05 && el.getBoundingClientRect().height > 40
    }).length,
  }
}), null, 1))
console.log('errors:', errs.length ? errs.slice(0, 5) : 'none')
await B.close()
