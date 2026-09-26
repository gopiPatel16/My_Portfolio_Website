/**
 * Design QA helper: drives the local dev server with headless Chrome and
 * captures each section at a given viewport, plus console/page errors.
 *
 *   node scripts/shots.mjs [url] [width] [height] [outDir]
 */
import puppeteer from 'puppeteer-core'
import { mkdir } from 'node:fs/promises'

const URL = process.argv[2] ?? 'http://localhost:5180/'
const WIDTH = Number(process.argv[3] ?? 1440)
const HEIGHT = Number(process.argv[4] ?? 900)
const OUT = process.argv[5] ?? 'C:/Users/USER/AppData/Local/Temp/claude/shots'
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe'

await mkdir(OUT, { recursive: true })

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--force-device-scale-factor=1', '--hide-scrollbars'],
  defaultViewport: { width: WIDTH, height: HEIGHT, deviceScaleFactor: 1 },
})

const page = await browser.newPage()
const problems = []
page.on('console', (m) => {
  if (m.type() === 'error' || m.type() === 'warning') problems.push(`[${m.type()}] ${m.text()}`)
})
page.on('pageerror', (e) => problems.push(`[pageerror] ${e.message}`))
page.on('requestfailed', (r) => problems.push(`[404?] ${r.url()} — ${r.failure()?.errorText}`))

await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 })

// Let entrance animations settle, then disable smooth scroll for deterministic jumps.
await new Promise((r) => setTimeout(r, 2200))
await page.evaluate(() => {
  document.documentElement.style.scrollBehavior = 'auto'
})

const sections = await page.evaluate(() =>
  [...document.querySelectorAll('main > section')].map((s) => ({
    id: s.id,
    top: Math.round(s.offsetTop),
    height: Math.round(s.offsetHeight),
  })),
)

const label = `${WIDTH}`
const shots = []

for (const s of sections) {
  const pages = Math.max(1, Math.ceil(s.height / HEIGHT))
  for (let i = 0; i < pages; i++) {
    const y = s.top + i * HEIGHT
    await page.evaluate((v) => window.scrollTo(0, v), y)
    // Reveal animations are triggered by IntersectionObserver.
    await new Promise((r) => setTimeout(r, 900))
    const file = `${OUT}/${label}-${s.id}-${i + 1}.png`
    await page.screenshot({ path: file })
    shots.push(file)
  }
}

// Horizontal overflow check.
const overflow = await page.evaluate(() => {
  const docW = document.documentElement.scrollWidth
  const winW = window.innerWidth
  const wide = []
  if (docW > winW + 1) {
    document.querySelectorAll('*').forEach((el) => {
      const r = el.getBoundingClientRect()
      if (r.right > winW + 2 || r.left < -2) {
        wide.push(`${el.tagName}.${String(el.className).slice(0, 60)} → ${Math.round(r.left)}..${Math.round(r.right)}`)
      }
    })
  }
  return { docW, winW, wide: wide.slice(0, 12) }
})

console.log(JSON.stringify({ viewport: [WIDTH, HEIGHT], sections, overflow, problems, shots }, null, 2))
await browser.close()
