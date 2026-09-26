import puppeteer from 'puppeteer-core'
const OUT='C:/Users/USER/AppData/Local/Temp/claude/shots/x'
const b = await puppeteer.launch({
  executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless:'new', args:['--hide-scrollbars'],
  defaultViewport:{width:1440,height:900},
})
const p = await b.newPage()
const errs=[]
p.on('pageerror',e=>errs.push(String(e.message)))
p.on('console',m=>{ if(m.type()==='error') errs.push(m.text()) })
await p.goto('http://localhost:5180/',{waitUntil:'domcontentloaded'})
await new Promise(r=>setTimeout(r,2000))
await p.evaluate(()=>{document.documentElement.style.scrollBehavior='auto'})

// 1. Expand every "Also built" row.
const toggles = await p.$$('#work h4 > button')
for (const t of toggles) { await p.evaluate(el=>el.click(), t); await new Promise(r=>setTimeout(r,140)) }
await new Promise(r=>setTimeout(r,900))
const expanded = await p.evaluate(()=>({
  open: [...document.querySelectorAll('#work h4 > button')].filter(b=>b.getAttribute('aria-expanded')==='true').length,
  reports: [...document.querySelectorAll('#work a[href^="/reports/"]')].map(a=>a.getAttribute('href')),
  sources: [...document.querySelectorAll('#work a[href*="github.com"]')].map(a=>a.href),
  docH: document.body.scrollHeight,
}))
const row = await p.$('#case-gk-master')
await p.evaluate(el=>el.scrollIntoView({block:'center'}), row)
await new Promise(r=>setTimeout(r,700))
await p.screenshot({path:`${OUT}-expanded.png`})

// 2. Skills tabs.
const tabs = await p.$$('[role="tab"]')
await p.evaluate(el=>el.click(), tabs[3]); await new Promise(r=>setTimeout(r,500))
const tabState = await p.evaluate(()=>({
  selected: document.querySelector('[role="tab"][aria-selected="true"]')?.textContent,
  chips: document.querySelectorAll('#skills li span[tabindex]').length,
}))

// 3. Agent pipeline node selection.
await p.evaluate(()=>document.getElementById('ai').scrollIntoView())
const nodes = await p.$$('#ai ol button')
await p.evaluate(el=>el.click(), nodes[5]); await new Promise(r=>setTimeout(r,500))
const agentState = await p.evaluate(()=>document.querySelector('#ai [aria-current="true"]')?.textContent)

// 5. Featured project screenshot dots.
await p.evaluate(()=>document.getElementById('work').scrollIntoView())
const dots = await p.$$('#work button[aria-label^="Show screenshot"]')
if (dots[2]) { await p.evaluate(el=>el.click(), dots[2]); await new Promise(r=>setTimeout(r,600)) }

// 6. Mobile menu.
await p.setViewport({width:390,height:844})
await new Promise(r=>setTimeout(r,600))
await p.evaluate(()=>window.scrollTo(0,0))
const burger = await p.$('button[aria-label="Open menu"]')
await p.evaluate(el=>el.click(), burger)
await new Promise(r=>setTimeout(r,700))
await p.screenshot({path:`${OUT}-menu.png`})
const menu = await p.evaluate(()=>({
  items: [...document.querySelectorAll('a[href^="#"]')].filter(a=>a.closest('.fixed.inset-0')).map(a=>a.textContent.replace(/\s+/g,' ').trim()),
  bodyLocked: getComputedStyle(document.body).overflow,
}))
const close = await p.$('button[aria-label="Close menu"]')
await p.evaluate(el=>el.click(), close); await new Promise(r=>setTimeout(r,600))
const afterClose = await p.evaluate(()=>getComputedStyle(document.body).overflow)

console.log(JSON.stringify({errs, expanded, tabState, agentState, menu, afterClose}, null, 1))
await b.close()
