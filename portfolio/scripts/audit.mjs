/**
 * Pre-flight audit: link integrity, heading order, alt text, contrast-critical
 * colours, focusability, and a reduced-motion render.
 *
 *   node scripts/audit.mjs [url]
 */
import puppeteer from 'puppeteer-core'

const URL = process.argv[2] ?? 'http://localhost:5180/'
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe'

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  defaultViewport: { width: 1440, height: 900 },
})

const page = await browser.newPage()
const failed = []
page.on('requestfailed', (r) => failed.push(`${r.url()} — ${r.failure()?.errorText}`))
page.on('response', (r) => {
  if (r.status() >= 400) failed.push(`HTTP ${r.status()} — ${r.url()}`)
})
page.on('pageerror', (e) => failed.push(`pageerror: ${e.message}`))
await page.goto(URL, { waitUntil: 'domcontentloaded' })
await new Promise((r) => setTimeout(r, 1500))

// Walk the page so every lazy image is requested before we judge it.
await page.evaluate(async () => {
  document.documentElement.style.scrollBehavior = 'auto'
  const step = window.innerHeight * 0.8
  for (let y = 0; y < document.body.scrollHeight; y += step) {
    window.scrollTo(0, y)
    await new Promise((r) => setTimeout(r, 130))
  }
  window.scrollTo(0, 0)
})
await new Promise((r) => setTimeout(r, 2500))

const report = await page.evaluate(() => {
  const anchors = [...document.querySelectorAll('a[href]')]
  const internal = anchors
    .map((a) => a.getAttribute('href'))
    .filter((h) => h.startsWith('#'))
  const brokenAnchors = [...new Set(internal)].filter(
    (h) => h !== '#' && !document.querySelector(h),
  )
  const external = [...new Set(anchors.map((a) => a.href).filter((h) => /^https?:/.test(h)))]
  const files = [...new Set(anchors.map((a) => a.getAttribute('href')).filter((h) => h?.startsWith('/')))]
  const mailtos = [...new Set(anchors.map((a) => a.href).filter((h) => /^(mailto|tel):/.test(h)))]

  const imgs = [...document.querySelectorAll('img')]
  const noAlt = imgs.filter((i) => !i.hasAttribute('alt')).map((i) => i.src)
  const emptyAlt = imgs.filter((i) => i.alt === '').map((i) => i.src)
  const notLoaded = imgs.filter((i) => !i.complete || i.naturalWidth === 0).map((i) => i.src)
  const videos = [...document.querySelectorAll('video')].map((v) => v.getAttribute('src'))

  const headings = [...document.querySelectorAll('h1,h2,h3,h4')].map((h) => ({
    level: Number(h.tagName[1]),
    text: h.textContent.trim().slice(0, 46),
  }))
  let headingJumps = []
  for (let i = 1; i < headings.length; i++) {
    if (headings[i].level - headings[i - 1].level > 1) {
      headingJumps.push(`${headings[i - 1].level}→${headings[i].level}: ${headings[i].text}`)
    }
  }

  const buttonsNoLabel = [...document.querySelectorAll('button')].filter(
    (b) => !b.textContent.trim() && !b.getAttribute('aria-label'),
  ).length

  const inputsNoLabel = [...document.querySelectorAll('input,textarea')].filter(
    (el) => !el.id || !document.querySelector(`label[for="${el.id}"]`),
  ).length

  const focusable = document.querySelectorAll(
    'a[href],button,input,textarea,select,[tabindex]:not([tabindex="-1"])',
  ).length

  return {
    counts: { h1: headings.filter((h) => h.level === 1).length, images: imgs.length, focusable },
    brokenAnchors,
    external,
    files,
    mailtos,
    noAlt,
    emptyAlt,
    notLoaded,
    videos,
    headingJumps,
    buttonsNoLabel,
    inputsNoLabel,
    title: document.title,
    description: document.querySelector('meta[name=description]')?.content?.length,
  }
})

// Reduced-motion render: every section must still be visible.
const rm = await browser.newPage()
await rm.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
await rm.setViewport({ width: 1440, height: 900 })
await rm.goto(URL, { waitUntil: 'domcontentloaded' })
await new Promise((r) => setTimeout(r, 1500))
const reduced = await rm.evaluate(() => {
  const hidden = []
  document.querySelectorAll('main h2, main h3, main p').forEach((el) => {
    const cs = getComputedStyle(el)
    if (Number(cs.opacity) < 0.9) hidden.push(el.textContent.trim().slice(0, 40))
  })
  return { hiddenCount: hidden.length, sample: hidden.slice(0, 5), docH: document.body.scrollHeight }
})
await rm.screenshot({ path: 'C:/Users/USER/AppData/Local/Temp/claude/shots/reduced-motion.png' })

console.log(JSON.stringify({ requestFailures: failed, ...report, reducedMotion: reduced }, null, 1))
await browser.close()
