/**
 * GK Master gates on a welcome screen and its routes bounce back until you
 * start, so it needs driving rather than direct navigation: start the app,
 * answer a question, then walk the bottom navigation.
 */
import http from 'node:http'
import { createReadStream, existsSync, statSync, mkdirSync } from 'node:fs'
import path from 'node:path'
import puppeteer from 'puppeteer-core'

const DIR = 'E:/Profile Portfolio/projects/GK/dist'
const OUT = path.resolve('scripts/.captures/gk-master')
const PORT = 7112
const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.webp': 'image/webp', '.ico': 'image/x-icon', '.woff2': 'font/woff2',
  '.pdf': 'application/pdf', '.txt': 'text/plain',
}

mkdirSync(OUT, { recursive: true })
const server = http.createServer((req, res) => {
  const url = decodeURIComponent((req.url || '/').split('?')[0])
  let file = path.join(DIR, url)
  if (existsSync(file) && statSync(file).isDirectory()) file = path.join(file, 'index.html')
  if (!existsSync(file)) file = path.join(DIR, 'index.html')
  res.writeHead(200, {
    'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream',
    'Cache-Control': 'no-store',
  })
  createReadStream(file).pipe(res)
})
await new Promise((r) => server.listen(PORT, r))

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  args: ['--hide-scrollbars'],
})
const page = await browser.newPage()
await page.setViewport({ width: 430, height: 920, deviceScaleFactor: 2 })
const log = []
const shot = async (name) => {
  await new Promise((r) => setTimeout(r, 900))
  await page.screenshot({ path: path.join(OUT, `${name}.png`) })
  log.push(`OK   ${name}`)
}

/** Click the first element whose trimmed text matches. */
const clickText = async (text, sel = 'button, a, [role="button"]') =>
  page.evaluate(
    (t, s) => {
      const el = [...document.querySelectorAll(s)].find((e) =>
        (e.textContent || '').trim().toLowerCase().includes(t.toLowerCase()),
      )
      if (el) { el.click(); return true }
      return false
    },
    text,
    sel,
  )

await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle2' })
await new Promise((r) => setTimeout(r, 2500))
await shot('welcome')

log.push(`start clicked: ${await clickText('Start Learning')}`)
await new Promise((r) => setTimeout(r, 2200))
await shot('home')

// Into the daily challenge.
for (const label of ['Daily Challenge', 'Start', 'Begin', 'Continue']) {
  if (await clickText(label)) { log.push(`entered via: ${label}`); break }
}
await new Promise((r) => setTimeout(r, 2200))
await shot('question')

// Answer whichever option is offered, to reach the explanation state.
const answered = await page.evaluate(() => {
  const opts = [...document.querySelectorAll('button')].filter((b) => {
    const t = (b.textContent || '').trim()
    return t.length > 1 && /^[A-D][).\s]/.test(t)
  })
  const pool = opts.length ? opts : [...document.querySelectorAll('button')].slice(2, 6)
  if (pool.length) { pool[0].click(); return pool[0].textContent.trim().slice(0, 40) }
  return null
})
log.push(`answered: ${answered}`)
await new Promise((r) => setTimeout(r, 1800))
await shot('answered')

for (const nav of ['Practice', 'Progress', 'Settings']) {
  const ok = await clickText(nav, 'a, button, [role="tab"], nav *')
  await new Promise((r) => setTimeout(r, 2000))
  if (ok) await shot(nav.toLowerCase())
  else log.push(`MISS ${nav}`)
}

console.log(log.join('\n'))
await browser.close()
server.close()
