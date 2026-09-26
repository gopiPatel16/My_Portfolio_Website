import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new', args:['--hide-scrollbars'],
  defaultViewport: { width: 390, height: 844 },
})
const p = await b.newPage()
await p.goto('http://localhost:5180/', { waitUntil: 'networkidle2' })
await new Promise(r => setTimeout(r, 2500))
console.log(JSON.stringify(await p.evaluate(() => {
  const shell = document.querySelector('#home .shell')
  const grid = shell.querySelector('.grid')
  const col = grid.firstElementChild
  const cs = getComputedStyle(grid)
  return {
    gridCols: cs.gridTemplateColumns,
    gridW: getComputedStyle(grid).width,
    colW: getComputedStyle(col).width,
    colTransform: getComputedStyle(col).transform,
    colCls: String(col.className),
    childCount: grid.children.length,
    childRects: [...grid.children].map(c => [String(c.className).slice(0,40), Math.round(c.getBoundingClientRect().width)]),
  }
}), null, 1))
await b.close()
