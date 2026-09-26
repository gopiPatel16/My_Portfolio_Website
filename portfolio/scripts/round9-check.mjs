/**
 * Toolkit as one tab set (AI tools first), and the Education & experience
 * section: its groups, documents, thumbnails and the nav link to it.
 *
 *   node scripts/round9-check.mjs <screenshot-dir>
 */
import puppeteer from 'puppeteer-core'

const out = process.argv[2]
const B = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  args: ['--no-sandbox'],
})

async function open(width, height) {
  const p = await B.newPage()
  await p.setViewport({ width, height })
  const bad = []
  p.on('response', (r) => { if (r.status() >= 400) bad.push(`${r.status()} ${r.url()}`) })
  p.on('pageerror', (e) => bad.push(`pageerror ${String(e).slice(0, 160)}`))
  await p.goto('http://localhost:5180/', { waitUntil: 'domcontentloaded' })
  await p.evaluate(() => { history.scrollRestoration = 'manual'; scrollTo(0, 0) })
  await new Promise((r) => setTimeout(r, 2500))
  return { p, bad }
}

async function scrollToId(p, id, offset = 90) {
  for (let n = 0; n < 300; n++) {
    const top = await p.evaluate((s) => document.getElementById(s).getBoundingClientRect().top, id)
    if (Math.abs(top - offset) < 30) break
    const d = top - offset
    await p.mouse.wheel({ deltaY: d > 0 ? Math.min(500, d) : Math.max(-500, d) })
    await new Promise((r) => setTimeout(r, 40))
  }
  await new Promise((r) => setTimeout(r, 1400))
}

for (const [w, h] of [[1234, 800], [390, 844]]) {
  const { p, bad } = await open(w, h)

  // ------------------------------------------------------------- toolkit
  await scrollToId(p, 'toolkit')
  const tk = await p.evaluate(() => {
    const t = document.getElementById('toolkit')
    const tabs = [...t.querySelectorAll('[role="tab"]')]
    return {
      tabs: tabs.map((b) => b.textContent.trim()),
      firstSelected: tabs[0]?.getAttribute('aria-selected') === 'true',
      toolGroups: [...t.querySelectorAll('.label')].map((l) => l.textContent.trim()).filter((x) => x !== 'AI toolkit & techniques'),
      toolChips: t.querySelectorAll('[role="tablist"] ~ * li, .mt-7 li').length,
      oldCardsGone: t.querySelectorAll('.panel').length === 0,
      oldHeadingGone: !t.innerText.includes('Techniques & technical skills') && !t.innerText.includes('Techniques & Technical Skills'),
    }
  })
  if (w === 1234) await p.screenshot({ path: `${out}/r9-toolkit-tools.png` })
  await p.evaluate(() => [...document.querySelectorAll('#toolkit [role="tab"]')].find((b) => b.textContent.trim() === 'Frontend').click())
  await new Promise((r) => setTimeout(r, 700))
  tk.frontend = await p.evaluate(() => {
    const t = document.getElementById('toolkit')
    return { selected: t.querySelector('[role="tab"][aria-selected="true"]').textContent.trim(), chips: [...t.querySelectorAll('.mt-7 li')].map((l) => l.textContent.trim()).slice(0, 4) }
  })
  console.log(`toolkit ${w}:`, JSON.stringify(tk))

  // ------------------------------------------- education & experience
  await scrollToId(p, 'education')
  const ed = await p.evaluate(async () => {
    const s = document.getElementById('education')
    const imgs = [...s.querySelectorAll('img')]
    await Promise.all(imgs.map((i) => (i.complete ? null : new Promise((r) => { i.onload = r; i.onerror = r; setTimeout(r, 4000) }))))
    return {
      label: s.querySelector('.label')?.textContent.trim(),
      title: s.querySelector('h2')?.textContent.trim(),
      groups: [...s.querySelectorAll('h3')].map((h) => h.textContent.trim()),
      items: [...s.querySelectorAll('h4')].map((h) => h.textContent.trim()),
      thumbs: imgs.map((i) => `${i.naturalWidth}x${i.naturalHeight}`),
      docButtons: [...s.querySelectorAll('a')].map((a) => `${a.textContent.trim()} → ${a.getAttribute('href')}`),
      noAiFluency: !s.innerText.includes('AI Fluency'),
    }
  })
  console.log(`education ${w}:`, JSON.stringify(ed, null, 1))
  if (w === 1234) {
    await (await p.$('#education')).screenshot({ path: `${out}/r9-education.png` })
  }

  // Every document opens in the on-site reader with the right file.
  const opened = []
  const links = await p.evaluate(() => [...document.querySelectorAll('#education a')].filter((a) => a.getAttribute('href').startsWith('/credentials/')).length)
  for (let i = 0; i < links; i++) {
    await p.evaluate((k) => [...document.querySelectorAll('#education a')].filter((a) => a.getAttribute('href').startsWith('/credentials/'))[k].click(), i)
    await new Promise((r) => setTimeout(r, 800))
    opened.push(await p.evaluate(() => {
      const d = document.querySelector('[role="dialog"][aria-modal="true"]')
      return d ? d.querySelector('iframe')?.getAttribute('src') : 'NO PREVIEW'
    }))
    if (w === 1234 && i === 1) await p.screenshot({ path: `${out}/r9-cert-preview.png` })
    await p.keyboard.press('Escape')
    await new Promise((r) => setTimeout(r, 500))
  }
  console.log(`previews ${w}:`, JSON.stringify(opened))

  // Nav link (desktop) jumps to the section.
  if (w >= 960) {
    await p.evaluate(() => scrollTo(0, 0))
    await new Promise((r) => setTimeout(r, 800))
    await p.evaluate(() => [...document.querySelectorAll('header nav a')].find((a) => a.textContent.trim() === 'Experience').click())
    await new Promise((r) => setTimeout(r, 2500))
    console.log('nav Experience:', JSON.stringify(await p.evaluate(() => ({
      sectionTop: Math.round(document.getElementById('education').getBoundingClientRect().top),
      active: document.querySelector('header nav a[aria-current="true"]')?.textContent.trim(),
    }))))
  }
  const docW = await p.evaluate(() => document.documentElement.scrollWidth)
  console.log(`page ${w}: overflow=${docW > w}  bad requests=${bad.length ? JSON.stringify(bad) : 'none'}`)
  await p.close()
}
await B.close()
