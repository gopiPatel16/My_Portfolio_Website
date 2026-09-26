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
  const r=el.getBoundingClientRect()
  return {top: Math.round(r.top+window.scrollY), h: Math.round(r.height)}
})
const rows=[]
for (const f of [0.05,0.2,0.35,0.5,0.62]) {
  const want = Math.round(box.top + box.h*f)
  await p.evaluate((y)=>window.scrollTo(0,y), want)
  await new Promise(r=>setTimeout(r,1000))
  rows.push(await p.evaluate((want)=>{
    const el=[...document.querySelectorAll('div')].find(e=>e.className.includes('h-[280svh]'))
    const r=el.getBoundingClientRect()
    const visible=[...el.querySelectorAll('h3')].filter(h=>Number(getComputedStyle(h.parentElement).opacity)>0.5).map(h=>h.textContent)
    return {want, actual: Math.round(window.scrollY), relTop: Math.round(r.top), visible}
  }, want))
}
console.log(JSON.stringify(rows,null,1))
await b.close()
