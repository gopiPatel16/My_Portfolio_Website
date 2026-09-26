import puppeteer from 'puppeteer-core'
const B = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new', args: ['--no-sandbox'],
})
const p = await B.newPage()
await p.setViewport({ width: 1440, height: 900 })
const sample = async (label) => {
  const ys = []
  for (let i = 0; i < 6; i++) {
    ys.push(await p.evaluate(() => Math.round(scrollY)))
    await new Promise((r) => setTimeout(r, 500))
  }
  const section = await p.evaluate(() => {
    const ids = ['home', 'work', 'prompts', 'toolkit', 'skills', 'research', 'education', 'contact']
    return ids.find((id) => { const r = document.getElementById(id)?.getBoundingClientRect(); return r && r.top <= 120 && r.bottom > 120 }) || '?'
  })
  console.log(label, 'scrollY over 3s:', ys.join(' → '), '| section:', section)
}
// 1. A completely fresh visit: no history, nothing to restore.
await p.goto('http://localhost:5180/', { waitUntil: 'domcontentloaded' })
await sample('fresh load ')
// 2. Scroll somewhere else, then reload.
for (let n = 0; n < 40; n++) { await p.mouse.wheel({ deltaY: 400 }); await new Promise((r) => setTimeout(r, 40)) }
await new Promise((r) => setTimeout(r, 1500))
console.log('before reload scrollY', await p.evaluate(() => Math.round(scrollY)))
await p.reload({ waitUntil: 'domcontentloaded' })
await sample('after reload')
await B.close()
