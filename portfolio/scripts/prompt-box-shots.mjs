import puppeteer from 'puppeteer-core'
const out = process.argv[2]
const B = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'] })
for (const [width, cases] of [[1440, [1, 7, 14, 16]], [390, [16]]]) {
  const p = await B.newPage()
  await p.setViewport({ width, height: 900 })
  await p.goto('http://localhost:5180/', { waitUntil: 'domcontentloaded' })
  await new Promise((r) => setTimeout(r, 2000))
  for (let n = 0; n < 220; n++) {
    if (await p.evaluate(() => document.getElementById('prompts').getBoundingClientRect().top < 60)) break
    await p.mouse.wheel({ deltaY: 320 }); await new Promise((r) => setTimeout(r, 40))
  }
  await new Promise((r) => setTimeout(r, 1200))
  for (const c of cases) {
    await p.evaluate((k) => document.querySelector(`#prompts [data-chip="${k}"]`).click(), c - 1)
    await new Promise((r) => setTimeout(r, 1500))
    const grid = await p.evaluateHandle(() => document.querySelector('#prompts blockquote').closest('.grid'))
    await grid.screenshot({ path: `${out}/box-${width}-case${c}.png` })
    console.log('shot', width, 'case', c)
  }
  await p.close()
}
await B.close()
