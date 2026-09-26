/**
 * The offer letter sheet in Education & experience: it shows the real page,
 * opens it full size, hands over the PDF and closes cleanly. The text button
 * it replaced is gone; the nav resume button is expected to still be there.
 *
 *   node scripts/doc-photo-check.mjs <screenshot-dir>
 */
import puppeteer from 'puppeteer-core'

const out = process.argv[2]
const SHEETS = [{ name: 'offer letter', label: 'Open my offer letter full size' }]

const B = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  args: ['--no-sandbox'],
})

for (const [w, h] of [[1440, 900], [1346, 646], [1024, 768], [390, 844]]) {
  const p = await B.newPage()
  await p.setViewport({ width: w, height: h })
  await p.goto('http://localhost:5180/', { waitUntil: 'domcontentloaded' })
  await p.evaluate(() => { history.scrollRestoration = 'manual'; scrollTo(0, 0) })
  await new Promise((r) => setTimeout(r, 2200))

  // The text button the sheet replaced should be gone. The nav resume button
  // is deliberately still there, so it is reported rather than flagged.
  const leftovers = await p.evaluate(() =>
    [...document.querySelectorAll('#education a')]
      .map((el) => el.textContent.trim())
      .filter((t) => /^view offer letter$/i.test(t)))
  const navResume = await p.evaluate(() =>
    [...document.querySelectorAll('header a')].some((a) => a.textContent.includes('View resume')))

  const results = {}
  for (const sheet of SHEETS) {
    const found = await p.evaluate(async (label) => {
      const a = document.querySelector(`a[aria-label="${label}"]`)
      if (!a) return { found: false }
      a.scrollIntoView({ block: 'center' })
      await new Promise((r) => setTimeout(r, 1000))
      const img = a.querySelector('img')
      return {
        found: true,
        href: a.getAttribute('href'),
        width: Math.round(a.getBoundingClientRect().width),
        imgLoaded: img.complete && img.naturalWidth > 0,
        caption: a.parentElement.querySelector('p')?.textContent.trim(),
      }
    }, sheet.label)

    await p.evaluate((label) => document.querySelector(`a[aria-label="${label}"]`).click(), sheet.label)
    await new Promise((r) => setTimeout(r, 1400))
    const modal = await p.evaluate(() => {
      const d = document.querySelector('[role="dialog"][aria-modal="true"]')
      if (!d) return { open: false }
      const img = d.querySelector('img')
      const box = img.parentElement
      const dl = [...d.querySelectorAll('a')].find((a) => a.hasAttribute('download'))
      return {
        open: true,
        title: d.querySelector('p')?.textContent.trim(),
        showsImage: !!img && !d.querySelector('iframe'),
        imgSrc: img.getAttribute('src'),
        imgLoaded: img.complete && img.naturalWidth > 0,
        imgWidth: Math.round(img.getBoundingClientRect().width),
        scrollable: box.scrollHeight > box.clientHeight,
        download: dl ? `${dl.getAttribute('href')} as ${dl.getAttribute('download')}` : 'MISSING',
        rootInert: document.getElementById('root').hasAttribute('inert'),
      }
    })
    if (w === 1440) await p.screenshot({ path: `${out}/doc-full-${sheet.name.replace(' ', '-')}.png` })

    await p.keyboard.press('Escape')
    await new Promise((r) => setTimeout(r, 1500))
    const after = await p.evaluate((label) => ({
      closed: !document.querySelector('[role="dialog"][aria-modal="true"]'),
      inert: document.getElementById('root').hasAttribute('inert'),
      focusBack: document.activeElement?.getAttribute('aria-label') === label,
    }), sheet.label)

    results[sheet.name] = { ...found, modal, after }
  }

  const overflow = await p.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)
  await p.evaluate(() => document.getElementById('education').scrollIntoView())
  await new Promise((r) => setTimeout(r, 1200))
  await p.screenshot({ path: `${out}/doc-sheets-${w}.png` })

  console.log(`${w}x${h}:`, JSON.stringify({ oldOfferLetterButton: leftovers, navResume, overflow, ...results }))
  await p.close()
}
await B.close()
