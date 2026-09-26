import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({
  executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless:'new', args:['--hide-scrollbars'], defaultViewport:{width:1440,height:900},
})
const p = await b.newPage()
await p.goto('http://localhost:5180/',{waitUntil:'domcontentloaded'})
await new Promise(r=>setTimeout(r,1800))

// Lenis owns the scroll position, so drive it the way a person would.
const target = await p.evaluate(()=>{
  const a=document.querySelectorAll('#work article')[0]
  return a.getBoundingClientRect().top + window.scrollY - 240
})
await p.mouse.move(720,450)
for (let guard=0; guard<80; guard++){
  const y = await p.evaluate(()=>window.scrollY)
  if (Math.abs(y-target) < 40) break
  await p.mouse.wheel({deltaY: Math.sign(target-y) * Math.min(400, Math.abs(target-y))})
  await new Promise(r=>setTimeout(r,90))
}
await new Promise(r=>setTimeout(r,900))

const box = await (await p.$$('#work article'))[0].boundingBox()
await p.mouse.move(box.x+20, box.y+110)
await new Promise(r=>setTimeout(r,350))
await p.mouse.move(box.x+box.width*0.62, box.y+110, {steps:14})
await new Promise(r=>setTimeout(r,600))
await p.screenshot({path:'C:/Users/USER/AppData/Local/Temp/claude/shots/scrub.png'})
console.log('frame', await p.evaluate(()=>{
  const a=document.querySelectorAll('#work article')[0]
  return [...a.querySelectorAll('img')].findIndex(i=>getComputedStyle(i).opacity==='1')+1
}))
await b.close()
