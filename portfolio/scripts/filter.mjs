import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({
  executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless:'new', args:['--hide-scrollbars'], defaultViewport:{width:1440,height:900},
})
const p = await b.newPage()
const errs=[]; p.on('pageerror',e=>errs.push(String(e.message)))
await p.goto('http://localhost:5180/',{waitUntil:'networkidle2'})
await new Promise(r=>setTimeout(r,2000))
const out=[]
const count = () => p.evaluate(()=>document.querySelectorAll('#work .grid > div > article').length)
out.push({filter:'All Projects', cards: await count()})
for (const label of ['AI & GenAI','Full-Stack','Mobile','Frontend']) {
  await p.evaluate(()=>document.querySelector('#work button[aria-haspopup="listbox"]').click())
  await new Promise(r=>setTimeout(r,300))
  const ok = await p.evaluate((l)=>{
    const btn=[...document.querySelectorAll('#work [role="listbox"] button')].find(b=>b.textContent.trim()===l)
    if(!btn) return false; btn.click(); return true
  }, label)
  await new Promise(r=>setTimeout(r,700))
  out.push({filter:label, clicked: ok, cards: await count()})
}
console.log(JSON.stringify({errs,out},null,1))
await b.close()
