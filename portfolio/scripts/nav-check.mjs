import puppeteer from 'puppeteer-core'
const B = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new', args: ['--no-sandbox'],
})
for (const w of [390, 820, 1004, 1023, 1024, 1100, 1234, 1440, 1920]) {
  const p = await B.newPage()
  await p.setViewport({ width: w, height: 900 })
  await p.goto('http://localhost:5180/', { waitUntil: 'domcontentloaded' })
  await new Promise((r) => setTimeout(r, 1800))
  console.log(w, JSON.stringify(await p.evaluate(() => {
    const nav = document.querySelector('header nav')
    const ul = nav.querySelector('ul')
    const actions = nav.querySelector('div')
    const shell = nav.parentElement
    const r = (e) => { const b = e.getBoundingClientRect(); return [Math.round(b.left), Math.round(b.right)] }
    const links = [...ul.querySelectorAll('li')].map((li) => r(li))
    return {
      navW: Math.round(nav.getBoundingClientRect().width),
      shellW: Math.round(shell.getBoundingClientRect().width),
      linksVisible: getComputedStyle(ul).display !== 'none',
      linksBox: links.length ? [links[0][0], links[links.length - 1][1]] : null,
      actions: r(actions),
      // Do the centred links run into the right-hand actions?
      collide: links.length ? links[links.length - 1][1] > r(actions)[0] - 8 : false,
      docW: document.documentElement.scrollWidth, win: innerWidth,
    }
  })))
  await p.close()
}
await B.close()
