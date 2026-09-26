import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({
  executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless:'new', args:['--hide-scrollbars','--autoplay-policy=no-user-gesture-required','--mute-audio'],
  defaultViewport:{width:1440,height:900},
})
const p = await b.newPage()
const bad=[]; const errs=[]
p.on('response', r => { if (r.status() >= 400) bad.push(`${r.status()} ${r.url().split('/').pop()}`) })
p.on('pageerror', e => errs.push(String(e.message).slice(0,100)))
await p.goto('http://localhost:5180/', { waitUntil:'domcontentloaded' })
await new Promise(r=>setTimeout(r,1800))
await p.evaluate(()=>{ document.documentElement.style.scrollBehavior='auto'
  document.getElementById('prompts').scrollIntoView() })
await new Promise(r=>setTimeout(r,1200))

const total = await p.evaluate(()=>document.querySelectorAll('#prompts [role="tab"]').length)
const rows=[]
for (let i=0;i<total;i++){
  await p.evaluate(n=>document.querySelectorAll('#prompts [role="tab"]')[n].click(), i)
  await new Promise(r=>setTimeout(r,1100))
  rows.push(await p.evaluate(()=>{
    const sec=document.getElementById('prompts')
    const title=sec.querySelector('[role="tab"][aria-selected="true"]')?.textContent?.replace(/^\d+/,'').trim().slice(0,38)
    // The output panel is the last panel in the prompt→model→output row.
    const panels=[...sec.querySelectorAll('.panel')]
    const out=panels[panels.length-1]
    const img=out?.querySelector('img')
    const vid=out?.querySelector('video')
    const txt=out?.querySelector('ol')
    return {
      title,
      media: vid ? 'video' : img ? 'image' : txt ? 'text' : 'NONE',
      ok: vid ? (vid.readyState>0||!!vid.getAttribute('poster')) : img ? (img.complete&&img.naturalWidth>0) : !!txt,
      counter: [...sec.querySelectorAll('span')].map(e=>e.textContent.trim()).find(t=>/^\d\d \/ \d\d$/.test(t)),
    }
  }))
}
// Arrow affordances
const arrows = await p.evaluate(()=>{
  const btns=[...document.querySelectorAll('#prompts button[aria-label]')].filter(b=>/examples/i.test(b.getAttribute('aria-label')))
  return btns.map(b=>({label:b.getAttribute('aria-label'), disabled:b.disabled}))
})
console.log(JSON.stringify({total, arrows, bad:[...new Set(bad)], errs:[...new Set(errs)], rows}, null, 1))
await b.close()
