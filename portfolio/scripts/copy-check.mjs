import puppeteer from 'puppeteer-core'
const ORIGIN = 'http://localhost:5180'
const B = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--no-sandbox'] })
await B.defaultBrowserContext().overridePermissions(ORIGIN, ['clipboard-read', 'clipboard-write', 'clipboard-sanitized-write'])
const p = await B.newPage()
await p.setViewport({ width: 1440, height: 900 })
await p.goto(`${ORIGIN}/`, { waitUntil: 'domcontentloaded' })
await new Promise((r) => setTimeout(r, 2500))
const total = await p.evaluate(() => document.querySelectorAll('#prompts [data-chip]').length)
const results = []
for (let i = 0; i < total; i++) {
  await p.evaluate((k) => document.querySelector(`#prompts [data-chip="${k}"]`).click(), i)
  await new Promise((r) => setTimeout(r, 700))
  await p.evaluate(() => [...document.querySelectorAll('#prompts button')].find((b) => /COPY/.test(b.textContent)).click())
  await new Promise((r) => setTimeout(r, 300))
  const r = await p.evaluate(async () => {
    const shown = document.querySelector('#prompts blockquote').textContent
    const clip = await navigator.clipboard.readText()
    return {
      exact: clip === shown,
      crlfOnly: clip.replace(/\r\n/g, '\n') === shown,
      shownNewlines: (shown.match(/\n/g) || []).length,
      extra: clip.length - shown.length,
    }
  })
  results.push(r)
}
const bad = results.filter((r) => !r.crlfOnly)
console.log('cases:', results.length)
console.log('identical after normalising line endings:', results.length - bad.length, '/', results.length)
console.log('every extra character is a CR before a newline:', results.every((r) => r.extra === 0 || r.extra === r.shownNewlines))
console.log('mismatches:', bad.length ? JSON.stringify(bad) : 'none')
await B.close()
