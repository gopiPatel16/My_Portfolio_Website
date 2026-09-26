import puppeteer from 'puppeteer-core'
const B = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new', args: ['--no-sandbox'],
})
const out = process.argv[2]
const p = await B.newPage()
await p.setViewport({ width: 1440, height: 900 })

// Hero without the scroll row
await p.goto('http://localhost:5180/', { waitUntil: 'domcontentloaded' })
await new Promise((r) => setTimeout(r, 2500))
console.log('hero:', JSON.stringify(await p.evaluate(() => {
  const h = document.getElementById('home')
  return {
    scrollRow: /SCROLL\s*\d{3}/.test(h.innerText),
    location: h.innerText.includes('RAIPUR'),
    roleLabel: h.innerText.includes('AI PROMPT ENGINEER'),
  }
})))
await p.screenshot({ path: `${out}/hero-no-scroll.png` })

// Chip strip still follows the active case, and the page does not move
for (let n = 0; n < 160; n++) {
  if (await p.evaluate(() => document.getElementById('prompts').getBoundingClientRect().top < 60)) break
  await p.mouse.wheel({ deltaY: 320 }); await new Promise((r) => setTimeout(r, 40))
}
await new Promise((r) => setTimeout(r, 1500))
const y0 = await p.evaluate(() => Math.round(scrollY))
const strip0 = await p.evaluate(() => Math.round(document.querySelector('#prompts .no-scrollbar').scrollLeft))
// Advance through cases with the next-arrow on the *case* navigation, via chips
for (let i = 0; i < 11; i++) {
  await p.evaluate((k) => {
    const chip = document.querySelector(`#prompts [data-chip="${k}"]`)
    chip?.click()
  }, i + 1)
  await new Promise((r) => setTimeout(r, 250))
}
await p.evaluate(() => document.querySelector('#prompts [data-chip="13"]')?.click())
await new Promise((r) => setTimeout(r, 1200))
const after = await p.evaluate(() => {
  const box = document.querySelector('#prompts .no-scrollbar')
  const chip = box.querySelector('[data-chip="13"]')
  const b = box.getBoundingClientRect(), c = chip.getBoundingClientRect()
  return { y: Math.round(scrollY), stripLeft: Math.round(box.scrollLeft),
    lastChipVisible: c.left >= b.left - 2 && c.right <= b.right + 2 }
})
console.log('strip:', JSON.stringify({ pageYBefore: y0, pageYAfter: after.y, pageMoved: Math.abs(after.y - y0) > 40,
  stripScrolledFrom: strip0, stripScrolledTo: after.stripLeft, activeChipInView: after.lastChipVisible }))

// A section link from another route still lands on its section
await p.goto('http://localhost:5180/#research', { waitUntil: 'domcontentloaded' })
await new Promise((r) => setTimeout(r, 3000))
console.log('hash link:', JSON.stringify(await p.evaluate(() => ({
  y: Math.round(scrollY),
  researchTop: Math.round(document.getElementById('research').getBoundingClientRect().top),
}))))
await B.close()
