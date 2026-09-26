import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({
  executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless:'new', args:['--hide-scrollbars'], defaultViewport:{width:1440,height:900},
})
const p = await b.newPage()
await p.goto('http://localhost:5180/',{waitUntil:'networkidle2'})
await new Promise(r=>setTimeout(r,2000))
console.log(JSON.stringify(await p.evaluate(()=>{
  const out=[]
  document.querySelectorAll('#work article').forEach(a=>{
    const title=a.querySelector('h3')?.textContent
    const plate=[...a.querySelectorAll('div')].find(d=>d.textContent?.match(/^(AI & GENAI|FULL-STACK|MOBILE|FRONTEND)/))
    if(plate){ const r=plate.getBoundingClientRect(); out.push({title, w:Math.round(r.width), h:Math.round(r.height)}) }
  })
  return out
}),null,1))
await b.close()
