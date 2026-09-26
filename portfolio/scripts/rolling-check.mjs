import puppeteer from 'puppeteer-core'
const B = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new', args: ['--no-sandbox'],
})
const p = await B.newPage()
await p.setViewport({ width: 1440, height: 900 })
await p.goto('http://localhost:5180/', { waitUntil: 'domcontentloaded' })
await p.evaluate(() => { history.scrollRestoration = 'manual'; scrollTo(0, 0) })
await new Promise((r) => setTimeout(r, 2200))
for (let n = 0; n < 90; n++) {
  if (await p.evaluate(() => document.getElementById('toolkit').getBoundingClientRect().top < 40)) break
  await p.mouse.wheel({ deltaY: 260 })
  await new Promise((r) => setTimeout(r, 55))
}
await new Promise((r) => setTimeout(r, 1200))
const read = () => p.evaluate(() =>
  [...document.querySelectorAll('#toolkit textPath')].map((t) => t.getAttribute('startOffset')))
const a = await read()
await new Promise((r) => setTimeout(r, 1500))
const b = await read()
console.log('labels           ', await p.evaluate(() =>
  [...document.querySelectorAll('#toolkit textPath')].map((t) => t.textContent)))
console.log('offsets t0       ', a.slice(0, 5))
console.log('offsets t0+1.5s  ', b.slice(0, 5))
console.log('moved            ', a.filter((v, i) => v !== b[i]).length, 'of', a.length)

// Reduced motion: nothing should move.
const q = await B.newPage()
await q.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
await q.setViewport({ width: 1440, height: 900 })
await q.goto('http://localhost:5180/', { waitUntil: 'domcontentloaded' })
await new Promise((r) => setTimeout(r, 2500))
const rmRead = () => q.evaluate(() =>
  [...document.querySelectorAll('#toolkit textPath')].map((t) => t.getAttribute('startOffset')))
const c = await rmRead()
await new Promise((r) => setTimeout(r, 1500))
const d = await rmRead()
console.log('reduced-motion moved', c.filter((v, i) => v !== d[i]).length, 'of', c.length)
await B.close()
