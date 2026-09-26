import puppeteer from 'puppeteer-core'
const B = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new', args: ['--no-sandbox'],
})
const out = process.argv[2]
for (const [w, h, tag] of [[1440, 900, 'd'], [390, 844, 'm']]) {
  const p = await B.newPage()
  await p.setViewport({ width: w, height: h })
  await p.goto('http://localhost:5180/', { waitUntil: 'domcontentloaded' })
  await p.evaluate(() => { history.scrollRestoration = 'manual'; scrollTo(0, 0) })
  await new Promise((r) => setTimeout(r, 2500))
  console.log(tag, JSON.stringify(await p.evaluate(() => {
    const s = getComputedStyle(document.body)
    const shell = document.querySelector('.shell')
    const cs = shell && getComputedStyle(shell)
    return {
      win: innerWidth, docW: document.documentElement.scrollWidth,
      bodyW: Math.round(document.body.getBoundingClientRect().width),
      bodyPadRight: s.paddingRight, bodyOverflow: s.overflow,
      rootInert: document.getElementById('root')?.hasAttribute('inert'),
      shellW: shell && Math.round(shell.getBoundingClientRect().width),
      shellMax: cs?.maxWidth, gutter: getComputedStyle(document.documentElement).getPropertyValue('--gutter'),
      zoom: s.zoom, transform: s.transform,
    }
  })))
  await p.screenshot({ path: `${out}/wide-${tag}.png` })
  await p.close()
}
await B.close()
