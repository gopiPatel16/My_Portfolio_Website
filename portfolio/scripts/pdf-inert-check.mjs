import puppeteer from 'puppeteer-core'
const B = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new', args: ['--no-sandbox'],
})
const p = await B.newPage()
await p.setViewport({ width: 1440, height: 900 })
await p.goto('http://localhost:5180/projects/gk-master', { waitUntil: 'domcontentloaded' })
await new Promise((r) => setTimeout(r, 1800))
await p.evaluate(() => [...document.querySelectorAll('a')]
  .find((a) => a.textContent.includes('Technical report')).click())
await new Promise((r) => setTimeout(r, 900))
console.log(await p.evaluate(() => {
  const root = document.getElementById('root')
  const dlg = document.querySelector('[role="dialog"][aria-modal="true"]')
  return {
    rootInert: root?.hasAttribute('inert'),
    dialogInsideRoot: !!dlg && root.contains(dlg),
    dialogParent: dlg?.parentElement?.tagName,
    bodyChildren: [...document.body.children].map((c) => `${c.tagName}#${c.id || ''}`),
    focusableOutsideRoot: [...document.querySelectorAll('a[href],button,iframe,input,[tabindex]')]
      .filter((el) => !root.contains(el)).length,
  }
}))
console.log('frames:', p.frames().length)
await B.close()
