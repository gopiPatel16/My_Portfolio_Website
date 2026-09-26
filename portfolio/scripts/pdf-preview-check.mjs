import puppeteer from 'puppeteer-core'
const B = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new', args: ['--no-sandbox'],
})
const out = process.argv[2]
const p = await B.newPage()
const downloads = []
await p.setViewport({ width: 1440, height: 900 })
const cdp = await p.createCDPSession()
await cdp.send('Browser.setDownloadBehavior', { behavior: 'deny' })
cdp.on('Browser.downloadWillBegin', (e) => downloads.push(e.suggestedFilename))
await p.goto('http://localhost:5180/', { waitUntil: 'domcontentloaded' })
await p.evaluate(() => { history.scrollRestoration = 'manual'; scrollTo(0, 0) })
await new Promise((r) => setTimeout(r, 2200))

async function scrollTo(id) {
  for (let n = 0; n < 140; n++) {
    if (await p.evaluate((s) => document.getElementById(s).getBoundingClientRect().top < 60, id)) break
    await p.mouse.wheel({ deltaY: 300 })
    await new Promise((r) => setTimeout(r, 45))
  }
  await new Promise((r) => setTimeout(r, 1400))
}

const state = () => p.evaluate(() => {
  const d = document.querySelector('[role="dialog"][aria-modal="true"]')
  const f = d?.querySelector('iframe')
  return {
    open: !!d,
    label: d?.getAttribute('aria-label') || null,
    iframeSrc: f?.getAttribute('src') || null,
    bodyOverflow: document.body.style.overflow,
    scrollY: Math.round(window.scrollY),
    focus: document.activeElement?.getAttribute('aria-label') || document.activeElement?.tagName,
  }
})

// --- Research: "Read the paper" -----------------------------------------
await scrollTo('research')
const before = await p.evaluate(() => Math.round(window.scrollY))
await p.evaluate(() => [...document.querySelectorAll('#research a')]
  .find((a) => a.textContent.includes('Read the paper')).click())
await new Promise((r) => setTimeout(r, 900))
console.log('paper       ', JSON.stringify(await state()))
console.log('  iframe present:', !!(await p.$('[role="dialog"] iframe')))
await p.screenshot({ path: `${out}/pdf-preview.png` })

// Esc closes and restores
await p.keyboard.press('Escape')
await new Promise((r) => setTimeout(r, 600))
const after = await state()
console.log('after Esc   ', JSON.stringify(after), 'scroll kept:', Math.abs(after.scrollY - before) < 40)

// --- Acceptance letter ---------------------------------------------------
await p.evaluate(() => [...document.querySelectorAll('#research a')]
  .find((a) => a.textContent.includes('Acceptance letter')).click())
await new Promise((r) => setTimeout(r, 800))
console.log('acceptance  ', JSON.stringify(await state()))
await p.evaluate(() => document.querySelector('[aria-label="Close preview"]').click())
await new Promise((r) => setTimeout(r, 500))

// --- Work grid: a Report pill -------------------------------------------
await scrollTo('work')
await p.evaluate(() => [...document.querySelectorAll('#work a')]
  .find((a) => a.textContent.trim().startsWith('Report')).click())
await new Promise((r) => setTimeout(r, 800))
console.log('report pill ', JSON.stringify(await state()))
await p.evaluate(() => document.querySelector('[aria-label="Close preview"]').click())
await new Promise((r) => setTimeout(r, 400))

// --- Project page: Technical report --------------------------------------
await p.goto('http://localhost:5180/projects/gk-master', { waitUntil: 'domcontentloaded' })
await new Promise((r) => setTimeout(r, 1800))
await p.evaluate(() => [...document.querySelectorAll('a')]
  .find((a) => a.textContent.includes('Technical report')).click())
await new Promise((r) => setTimeout(r, 800))
console.log('case study  ', JSON.stringify(await state()))

console.log('downloads triggered:', downloads.length ? downloads : 'none')
await B.close()
