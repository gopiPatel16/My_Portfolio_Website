import puppeteer from 'puppeteer-core'
const b=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:'new',args:['--hide-scrollbars'],defaultViewport:{width:1440,height:900}})
const p=await b.newPage()
await p.goto('http://localhost:5180/',{waitUntil:'domcontentloaded'})
await new Promise(r=>setTimeout(r,1500))
console.log(JSON.stringify(await p.evaluate(()=>({
  fine: matchMedia('(pointer: fine)').matches,
  coarse: matchMedia('(pointer: coarse)').matches,
  none: matchMedia('(pointer: none)').matches,
  hoverHover: matchMedia('(hover: hover)').matches,
  reduced: matchMedia('(prefers-reduced-motion: reduce)').matches,
})),null,1))
await b.close()
