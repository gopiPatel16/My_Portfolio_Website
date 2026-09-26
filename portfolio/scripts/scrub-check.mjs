import puppeteer from 'puppeteer-core'
const b=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:'new',args:['--hide-scrollbars'],defaultViewport:{width:1440,height:900}})
const p=await b.newPage()
const errs=[]; const bad=[]
p.on('pageerror',e=>errs.push(String(e.message).slice(0,90)))
p.on('response',r=>{if(r.status()>=400)bad.push(`${r.status()} ${r.url().split('/').pop()}`)})
await p.goto('http://localhost:5180/',{waitUntil:'domcontentloaded'})
await new Promise(r=>setTimeout(r,1800))
await p.evaluate(()=>{document.documentElement.style.scrollBehavior='auto';document.getElementById('work-grid').scrollIntoView()})
await new Promise(r=>setTimeout(r,1200))

const cards = await p.$$('#work article')
const rows=[]
for (let n=0;n<Math.min(4,cards.length);n++){
  const before = await p.evaluate(i=>{
    const a=document.querySelectorAll('#work article')[i]
    return {name:a.querySelector('h3')?.textContent, imgs:a.querySelectorAll('img').length}
  }, n)
  await p.evaluate(i=>document.querySelectorAll('#work article')[i].scrollIntoView({block:'center'}), n)
  await new Promise(r=>setTimeout(r,500))
  const box = await cards[n].boundingBox()
  // Enter, then scrub across the thumbnail.
  await p.mouse.move(box.x+20, box.y+110)
  await new Promise(r=>setTimeout(r,700))
  const mid = await p.evaluate(i=>{
    const a=document.querySelectorAll('#work article')[i]
    const vis=[...a.querySelectorAll('img')].filter(im=>getComputedStyle(im).opacity==='1').length
    return {imgs:a.querySelectorAll('img').length, visible:vis, counter:a.querySelector('span[aria-hidden].font-mono')?.textContent?.trim()}
  }, n)
  await p.mouse.move(box.x+box.width-14, box.y+110, {steps:16})
  await new Promise(r=>setTimeout(r,600))
  const after = await p.evaluate(i=>{
    const a=document.querySelectorAll('#work article')[i]
    const shown=[...a.querySelectorAll('img')].findIndex(im=>getComputedStyle(im).opacity==='1')
    return {imgsNow:a.querySelectorAll('img').length, shownIndex:shown}
  }, n)
  rows.push({name:before.name, imgsAtRest:before.imgs, imgsHovered:mid.imgs, visibleAtOnce:mid.visible, counter:mid.counter, frameAtRight:after.shownIndex})
  await p.mouse.move(10,10)
  await new Promise(r=>setTimeout(r,400))
}
console.log(JSON.stringify({errs:[...new Set(errs)], bad:[...new Set(bad)], rows},null,1))
await b.close()
