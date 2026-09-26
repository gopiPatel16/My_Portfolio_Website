import puppeteer from 'puppeteer-core'
const b=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:'new',args:['--hide-scrollbars'],defaultViewport:{width:1440,height:900}})
const p=await b.newPage()
await p.goto('http://localhost:5180/',{waitUntil:'domcontentloaded'})
await new Promise(r=>setTimeout(r,2600))
// Sample the rendered pixels behind the hero copy column.
const shot = await p.screenshot({encoding:'binary', clip:{x:90,y:180,width:560,height:420}})
const { default: sharp } = await import('node:util').then(()=>({default:null})).catch(()=>({default:null}))
await p.evaluate(()=>{})
console.log('bytes', shot.length)
await b.close()
