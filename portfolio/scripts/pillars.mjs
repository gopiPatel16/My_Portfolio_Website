import puppeteer from 'puppeteer-core'
const OUT='C:/Users/USER/AppData/Local/Temp/claude/shots/p'
const b = await puppeteer.launch({
  executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless:'new', args:['--hide-scrollbars'],
  defaultViewport:{width:1440,height:900},
})
const p = await b.newPage()
const errs=[]; p.on('pageerror',e=>errs.push(String(e.message)))
await p.goto('http://localhost:5180/',{waitUntil:'networkidle2'})
await new Promise(r=>setTimeout(r,2200))
const box = await p.evaluate(()=>{
  const el=[...document.querySelectorAll('div')].find(e=>e.className.includes('h-[280svh]'))
  if(!el) return null
  const r=el.getBoundingClientRect()
  return {top: Math.round(r.top + window.scrollY), h: Math.round(r.height)}
})
for (const f of [0.05,0.2,0.35,0.5]) {
  await p.evaluate((y)=>window.scrollTo(0,y), box.top + box.h*f)
  await new Promise(r=>setTimeout(r,1600))
  await p.screenshot({path:`${OUT}-${Math.round(f*100)}.png`})
}
console.log(JSON.stringify({box, errs}))
await b.close()
