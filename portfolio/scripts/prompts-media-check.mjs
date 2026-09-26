import puppeteer from 'puppeteer-core'
const B = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new', args: ['--no-sandbox'],
})
const out = process.argv[2]
const p = await B.newPage()
const bad = []
await p.setViewport({ width: 1440, height: 900 })
p.on('response', (r) => { if (r.status() >= 400 && r.url().includes('/prompts/')) bad.push(`${r.status()} ${r.url()}`) })
p.on('requestfailed', (r) => { if (r.url().includes('/prompts/')) bad.push(`FAIL ${r.url()}`) })
await p.goto('http://localhost:5180/', { waitUntil: 'domcontentloaded' })
await new Promise((r) => setTimeout(r, 2200))
for (let n = 0; n < 160; n++) {
  if (await p.evaluate(() => document.getElementById('prompts').getBoundingClientRect().top < 60)) break
  await p.mouse.wheel({ deltaY: 320 }); await new Promise((r) => setTimeout(r, 40))
}
await new Promise((r) => setTimeout(r, 1500))
const tabs = await p.evaluate(() =>
  [...document.querySelectorAll('#prompts [role="tab"], #prompts button')]
    .filter((b) => /^\d\d/.test(b.textContent.trim())).map((b) => b.textContent.trim()))
console.log('cases:', tabs.length, tabs.map((t) => t.split(/\s+/).slice(0, 1)).flat().join(' '))
console.log('stats:', await p.evaluate(() =>
  [...document.querySelectorAll('#prompts dl div')].map((d) => d.textContent.trim())))

for (const id of ['background', 'gow', 'freya']) {
  await p.evaluate((want) => {
    const b = [...document.querySelectorAll('#prompts button')]
      .find((x) => x.textContent.toLowerCase().includes(want))
    if (b) b.click()
  }, id === 'background' ? 'art-directing' : id === 'gow' ? 'cutting a sequence' : 'animating a still')
  await new Promise((r) => setTimeout(r, 1400))
  const m = await p.evaluate(() => {
    const v = document.querySelector('#prompts video')
    const i = document.querySelector('#prompts img[src*="/prompts/"]')
    const el = v || i
    const r = el?.getBoundingClientRect()
    return { tag: el?.tagName, src: v?.getAttribute('src') || i?.getAttribute('src'),
      poster: v?.getAttribute('poster') || null,
      w: r && Math.round(r.width), h: r && Math.round(r.height),
      loaded: i ? i.naturalWidth > 0 : (v?.readyState ?? null) }
  })
  console.log(id, JSON.stringify(m))
  await p.screenshot({ path: `${out}/prompt-${id}.png` })
}
console.log('bad prompt requests:', bad.length ? bad : 'none')
await B.close()
