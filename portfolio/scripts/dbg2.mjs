import puppeteer from 'puppeteer-core'
const b=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:'new',args:['--hide-scrollbars'],defaultViewport:{width:1440,height:900}})
const p=await b.newPage()
await p.goto('http://localhost:5180/',{waitUntil:'domcontentloaded'})
await new Promise(r=>setTimeout(r,1600))
await p.evaluate(()=>{document.documentElement.style.scrollBehavior='auto';document.getElementById('work-grid').scrollIntoView()})
await new Promise(r=>setTimeout(r,1000))
const info = await p.evaluate(()=>{
  const a=document.querySelector('#work article')
  const r=a.getBoundingClientRect()
  const thumbBox=a.firstElementChild
  const tb=thumbBox.getBoundingClientRect()
  const scrub=thumbBox.firstElementChild
  const sb=scrub.getBoundingClientRect()
  const x=Math.round(r.x+30), y=Math.round(r.y+40)
  const el=document.elementFromPoint(x,y)
  return {
    card:[Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)],
    thumb:[Math.round(tb.width),Math.round(tb.height)],
    scrubCls:scrub.className,
    scrubPos:getComputedStyle(scrub).position,
    scrubRect:[Math.round(sb.width),Math.round(sb.height)],
    point:[x,y],
    hit:el ? `${el.tagName}.${String(el.className).slice(0,60)}` : null,
    hitPE:el?getComputedStyle(el).pointerEvents:null,
  }
})
console.log(JSON.stringify(info,null,1))
await b.close()
