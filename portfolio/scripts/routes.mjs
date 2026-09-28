import puppeteer from 'puppeteer-core'
import { mkdirSync, readFileSync } from 'node:fs'
const OUT='C:/Users/USER/AppData/Local/Temp/claude/shots/routes'
mkdirSync(OUT,{recursive:true})
// Read the slugs from the data so a new project is never silently skipped.
const slugs=[...readFileSync('src/data/projects.ts','utf8').matchAll(/^\s{4}slug: '([a-z0-9-]+)',$/gm)].map(m=>m[1])
const b=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:'new',args:['--hide-scrollbars'],defaultViewport:{width:1440,height:900}})
const rows=[]
for(const slug of slugs){
  const p=await b.newPage()
  const errs=[]; const bad=[]
  p.on('pageerror',e=>errs.push(String(e.message).slice(0,90)))
  p.on('response',r=>{ if(r.status()>=400) bad.push(`${r.status()} ${r.url().split('/').pop()}`) })
  await p.goto(`http://localhost:5180/projects/${slug}`,{waitUntil:'domcontentloaded'})
  await new Promise(r=>setTimeout(r,1400))
  await p.evaluate(async()=>{document.documentElement.style.scrollBehavior='auto'
    const step=window.innerHeight*0.85
    for(let y=0;y<document.body.scrollHeight;y+=step){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,110))}
    window.scrollTo(0,0)})
  await new Promise(r=>setTimeout(r,1600))
  const info=await p.evaluate(()=>({
    h1:document.querySelector('h1')?.textContent?.slice(0,42),
    imgs:document.querySelectorAll('img').length,
    broken:[...document.querySelectorAll('img')].filter(i=>!i.complete||i.naturalWidth===0).length,
    h:Math.round(document.body.scrollHeight),
    overflow:document.documentElement.scrollWidth>window.innerWidth+1,
  }))
  if(slug==='knowledge-assistant'||slug==='gameverse') await p.screenshot({path:`${OUT}/${slug}.png`})
  rows.push({slug,...info,errs:errs.slice(0,2),bad:bad.slice(0,2)})
  await p.close()
}
console.log(JSON.stringify(rows,null,1))
await b.close()
