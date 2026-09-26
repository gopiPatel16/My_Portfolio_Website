import puppeteer from 'puppeteer-core'
const b=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:'new',args:['--hide-scrollbars']})
for (const [w,h] of [[1920,1000],[1440,900],[1024,800],[768,900],[390,844],[360,780]]) {
  const p=await b.newPage(); await p.setViewport({width:w,height:h})
  await p.goto('http://localhost:5180/',{waitUntil:'domcontentloaded'})
  await new Promise(r=>setTimeout(r,1500))
  const m=await p.evaluate(()=>{
    const el=document.querySelector('#home h1 span[aria-hidden]')
    const words=[...el.children].map(c=>({t:c.textContent.trim(), w:Math.round(c.getBoundingClientRect().width)}))
    const r=el.getBoundingClientRect()
    const shell=document.querySelector('#home .shell').getBoundingClientRect()
    return {lineW:Math.round(r.width), lineH:Math.round(r.height), avail:Math.round(shell.width), words,
      lines: new Set([...el.children].map(c=>Math.round(c.getBoundingClientRect().top))).size}
  })
  console.log(`${String(w).padStart(4)}px  line=${String(m.lineW).padStart(4)}  avail=${String(m.avail).padStart(4)}  rows=${m.lines}  ${m.words.map(x=>x.t+':'+x.w).join(' ')}`)
  await p.close()
}
await b.close()
