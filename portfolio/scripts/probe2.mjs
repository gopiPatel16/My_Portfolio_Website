import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({
  executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless:'new', args:['--hide-scrollbars'],
  defaultViewport:{width:1440,height:900},
})
const p = await b.newPage()
await p.goto('http://localhost:5180/',{waitUntil:'networkidle2'})
await new Promise(r=>setTimeout(r,2200))
const box = await p.evaluate(()=>{
  const el=[...document.querySelectorAll('div')].find(e=>e.className.includes('h-[280svh]'))
  const r=el.getBoundingClientRect(); return {top: Math.round(r.top+window.scrollY), h: Math.round(r.height)}
})
for (const f of [0.05, 0.2]) {
  await p.evaluate((y)=>window.scrollTo(0,y), Math.round(box.top+box.h*f))
  await new Promise(r=>setTimeout(r,1200))
  const info = await p.evaluate(()=>{
    const root=[...document.querySelectorAll('div')].find(e=>e.className.includes('h-[280svh]'))
    const sticky=root.firstElementChild
    const sr=sticky.getBoundingClientRect()
    const panels=[...root.querySelectorAll('h3')].map(h=>{
      const panel=h.parentElement, r=panel.getBoundingClientRect()
      return {t:h.textContent.slice(0,24), op:getComputedStyle(panel).opacity, top:Math.round(r.top), h:Math.round(r.height)}
    })
    const idx=[...root.querySelectorAll('span')].filter(s=>/^\d\d$/.test(s.textContent||'')).map(s=>{
      const r=s.getBoundingClientRect(); return {n:s.textContent, op:getComputedStyle(s).opacity, top:Math.round(r.top)}
    })
    return {scrollY:Math.round(window.scrollY), stickyTop:Math.round(sr.top), stickyH:Math.round(sr.height), panels, idx}
  })
  console.log(JSON.stringify(info,null,1))
}
await b.close()
