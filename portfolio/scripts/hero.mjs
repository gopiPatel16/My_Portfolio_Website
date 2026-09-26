import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({
  executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless:'new', args:['--hide-scrollbars'], defaultViewport:{width:1440,height:900},
})
const p = await b.newPage()
await p.goto('http://localhost:5180/',{waitUntil:'networkidle2'})
await new Promise(r=>setTimeout(r,2200))
console.log(JSON.stringify(await p.evaluate(()=>{
  const sec=document.getElementById('home')
  const wrap=sec.querySelector('.shell > div')
  const para=[...sec.querySelectorAll('p')].find(x=>x.textContent.startsWith('I work with'))
  const stand=[...sec.querySelectorAll('div')].find(d=>d.className.includes('w-[54%]'))
  const imgs=[...sec.querySelectorAll('img')].map(i=>{
    const r=i.getBoundingClientRect()
    return {src:i.getAttribute('src')?.split('/').pop(), w:Math.round(r.width), h:Math.round(r.height), x:Math.round(r.x), complete:i.complete, nat:i.naturalWidth}
  })
  return {
    wrapCls: wrap?.className,
    wrapW: wrap ? Math.round(wrap.getBoundingClientRect().width) : null,
    wrapMax: wrap ? getComputedStyle(wrap).maxWidth : null,
    paraW: para ? Math.round(para.getBoundingClientRect().width) : null,
    paraMax: para ? getComputedStyle(para).maxWidth : null,
    standFound: !!stand,
    standDisplay: stand ? getComputedStyle(stand).display : null,
    imgs,
  }
}),null,1))
await b.close()
