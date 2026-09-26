import puppeteer from 'puppeteer-core'
const b=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:'new',args:['--hide-scrollbars']})
// Coarse pointer: the scrubber should advance on its own once on screen.
const p=await b.newPage()
await p.emulate({viewport:{width:390,height:844,isMobile:true,hasTouch:true},userAgent:'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/140 Mobile Safari/537.36'})
await p.goto('http://localhost:5180/',{waitUntil:'domcontentloaded'})
await new Promise(r=>setTimeout(r,1600))
const media = await p.evaluate(()=>({
  fine:matchMedia('(pointer: fine)').matches,
  coarse:matchMedia('(pointer: coarse)').matches,
  reduced:matchMedia('(prefers-reduced-motion: reduce)').matches,
}))
const target = await p.evaluate(()=>document.querySelectorAll('#work article')[0].getBoundingClientRect().top+window.scrollY-200)
await p.mouse.move(190,400)
for(let g=0;g<160;g++){
  const y=await p.evaluate(()=>window.scrollY)
  const d=target-y
  if(Math.abs(d)<24) break
  // Ease down as we approach, or Lenis momentum overshoots the target.
  await p.mouse.wheel({deltaY:Math.sign(d)*Math.min(260,Math.max(40,Math.abs(d)*0.5))})
  await new Promise(r=>setTimeout(r,90))
}
// Let Lenis come to rest before judging visibility.
await new Promise(r=>setTimeout(r,2200))
const a=await p.evaluate(()=>{
  const c=document.querySelectorAll('#work article')[0]
  const scrub=c.firstElementChild.firstElementChild
  const r=scrub.getBoundingClientRect()
  return {imgs:c.querySelectorAll('img').length,
    frame:[...c.querySelectorAll('img')].findIndex(i=>getComputedStyle(i).opacity==='1'),
    scrubRect:[Math.round(r.top),Math.round(r.height)], vh:window.innerHeight}
})
await new Promise(r=>setTimeout(r,2600))
const c=await p.evaluate(()=>{
  const c=document.querySelectorAll('#work article')[0]
  const vis=[...c.querySelectorAll('img')].map(i=>Number(getComputedStyle(i).opacity))
  return {imgs:vis.length, maxOpacity:Math.max(...vis), frame:vis.findIndex(o=>o>0.5)}
})
console.log(JSON.stringify({media, first:a, later:c, advanced:a.frame!==c.frame},null,1))
await b.close()
