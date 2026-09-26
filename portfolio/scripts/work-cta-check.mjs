import puppeteer from 'puppeteer-core'
const B = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new', args: ['--no-sandbox'],
})
const p = await B.newPage()
await p.setViewport({ width: 1234, height: 646 })
await p.goto('http://localhost:5180/', { waitUntil: 'domcontentloaded' })
await new Promise((r) => setTimeout(r, 2000))
for (let n = 0; n < 200; n++) {
  const top = await p.evaluate(() => {
    const a = [...document.querySelectorAll('#work a')].find((x) => x.textContent.includes('View All Projects'))
    return a ? a.getBoundingClientRect().top : 9999
  })
  if (top > 250 && top < 400) break
  await p.mouse.wheel({ deltaY: top > 400 ? Math.min(300, top - 320) : -120 })
  await new Promise((r) => setTimeout(r, 45))
}
await new Promise((r) => setTimeout(r, 1500))
console.log(JSON.stringify(await p.evaluate(() => ({
  seeHowIWork: document.body.innerText.includes('See How I Work'),
  viewAllProjects: [...document.querySelectorAll('#work a')].some((x) => x.textContent.includes('View All Projects')),
}))))
await p.screenshot({ path: `${process.argv[2]}/work-cta.png` })
await B.close()
