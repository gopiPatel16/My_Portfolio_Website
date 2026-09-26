import puppeteer from 'puppeteer-core'
const B = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new', args: ['--no-sandbox'],
})
for (const w of [390, 820, 899, 900]) {
  const p = await B.newPage()
  await p.setViewport({ width: w, height: 844 })
  await p.goto('http://localhost:5180/', { waitUntil: 'domcontentloaded' })
  await new Promise((r) => setTimeout(r, 1600))
  const btn = await p.$('button[aria-label="Open menu"]')
  const visible = btn ? await btn.isIntersectingViewport() : false
  let menu = null
  if (visible) {
    await btn.click()
    await new Promise((r) => setTimeout(r, 600))
    menu = await p.evaluate(() => {
      const o = document.querySelector('[aria-label="Close menu"]')?.closest('div.fixed')
      return o ? { links: o.querySelectorAll('ul a').length, w: Math.round(o.getBoundingClientRect().width) } : null
    })
    await p.evaluate(() => document.querySelector('[aria-label="Close menu"]')?.click())
  }
  console.log(w, JSON.stringify({ hamburger: visible, menu }))
  await p.close()
}
await B.close()
