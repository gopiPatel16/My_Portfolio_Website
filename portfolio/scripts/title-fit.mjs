import puppeteer from 'puppeteer-core'
const B = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new', args: ['--no-sandbox'],
})
const candidates = [
  'Research paper on deepfake audio detection',
  'Research paper on deepfake audio',
  'A research paper on deepfake audio',
  'Research paper, accepted at IEEE',
  'Research paper',
]
for (const w of [1440, 1234, 390]) {
  const p = await B.newPage()
  await p.setViewport({ width: w, height: 900 })
  await p.goto('http://localhost:5180/', { waitUntil: 'domcontentloaded' })
  await new Promise((r) => setTimeout(r, 1800))
  const rows = await p.evaluate((list) => {
    const h = document.querySelector('#research h2')
    const lh = parseFloat(getComputedStyle(h).lineHeight) || parseFloat(getComputedStyle(h).fontSize) * 1.1
    return list.map((t) => {
      h.textContent = t
      return `${Math.round(h.getBoundingClientRect().height / lh)} lines  ${t}`
    })
  }, candidates)
  console.log(`--- ${w}px`)
  rows.forEach((r) => console.log('  ' + r))
  await p.close()
}
await B.close()
