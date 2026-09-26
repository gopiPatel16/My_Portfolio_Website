import puppeteer from 'puppeteer-core'
const B = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new', args: ['--no-sandbox'],
})
const p = await B.newPage()
await p.setViewport({ width: Number(process.argv[3] || 1440), height: 900 })
await p.goto('http://localhost:5180/projects/gk-master', { waitUntil: 'domcontentloaded' })
await new Promise((r) => setTimeout(r, 1800))
await p.evaluate(() => [...document.querySelectorAll('a')]
  .find((a) => a.textContent.includes('Technical report')).click())
await new Promise((r) => setTimeout(r, 900))
const seen = []
for (let i = 0; i < 6; i++) {
  await p.keyboard.press('Tab')
  await new Promise((r) => setTimeout(r, 120))
  seen.push(await p.evaluate(() => {
    const el = document.activeElement
    // BODY means focus is inside the PDF viewer's own subframe, where the top
    // document cannot see it. What matters is that it never lands on the page
    // behind the reader.
    const behind = !!el && el.tagName !== 'BODY' && document.getElementById('root').contains(el)
    return `${el?.tagName}${behind ? ' (BEHIND)' : ''}`
  }))
}
console.log('tab order:', seen.join(' -> '))
console.log('reached page behind reader:', seen.some((s) => s.includes('BEHIND')))
console.log('focusable outside the reader:', await p.evaluate(() => {
  const root = document.getElementById('root')
  return [...document.querySelectorAll('a[href],button,iframe,input,select,textarea,[tabindex]')]
    .filter((el) => !root.contains(el)).map((el) => el.getAttribute('aria-label') || el.tagName)
}))
await p.screenshot({ path: `${process.argv[2]}/pdf-preview-${process.argv[3] || 1440}.png` })
await B.close()
