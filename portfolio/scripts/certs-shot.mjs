import puppeteer from 'puppeteer-core'
const B = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--no-sandbox'] })
for (const [w, h] of [[1234, 800], [390, 844]]) {
  const p = await B.newPage()
  await p.setViewport({ width: w, height: h })
  await p.goto('http://localhost:5180/', { waitUntil: 'domcontentloaded' })
  await new Promise((r) => setTimeout(r, 2000))
  for (let n = 0; n < 400; n++) {
    const top = await p.evaluate(() => [...document.querySelectorAll('#education h3')].find((x) => x.textContent.includes('Certifications')).getBoundingClientRect().top)
    if (Math.abs(top - 100) < 30) break
    const d = top - 100
    await p.mouse.wheel({ deltaY: d > 0 ? Math.min(500, d) : Math.max(-500, d) }); await new Promise((r) => setTimeout(r, 40))
  }
  await new Promise((r) => setTimeout(r, 1800))
  console.log(w, JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('#education article')].map((a) => {
    const r = a.getBoundingClientRect()
    return { title: a.querySelector('h4').textContent, opacity: getComputedStyle(a.closest('li')).opacity, h: Math.round(r.height) }
  }))))
  await p.screenshot({ path: `${process.argv[2]}/r9-certs-${w}.png` })
  await p.close()
}
await B.close()
