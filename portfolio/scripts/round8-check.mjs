/**
 * Prompt side arrows at common laptop widths, the contact section without its
 * form, and the back-to-top button.
 *
 *   node scripts/round8-check.mjs <screenshot-dir>
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
  await p.goto('http://localhost:5180/', { waitUntil: 'domcontentloaded' })
  await p.evaluate(() => { history.scrollRestoration = 'manual'; scrollTo(0, 0) })
  await new Promise((r) => setTimeout(r, 2500))
  return p
}

async function scrollToId(p, id, offset = 40) {
  for (let n = 0; n < 300; n++) {
    const top = await p.evaluate((s) => document.getElementById(s).getBoundingClientRect().top, id)
    if (Math.abs(top - offset) < 30) break
    const d = top - offset
    await p.mouse.wheel({ deltaY: d > 0 ? Math.min(500, d) : Math.max(-500, d) })
    await new Promise((r) => setTimeout(r, 40))
  }
  await new Promise((r) => setTimeout(r, 1300))
}

// ------------------------------------------------------------ prompt arrows
for (const [w, h] of [[1440, 900], [1234, 646], [1024, 768], [390, 844]]) {
  const p = await open(w, h)
  await scrollToId(p, 'prompts', -260)
  const r = await p.evaluate(() => {
    const vis = (b) => b.getBoundingClientRect().width > 0 && getComputedStyle(b).visibility !== 'hidden'
    const all = [...document.querySelectorAll('#prompts button[aria-label="Next prompt"], #prompts button[aria-label="Previous prompt"]')]
    const side = all.filter((b) => b.className.includes('absolute') && vis(b))
    const row = all.filter((b) => !b.className.includes('absolute') && vis(b))
    const panels = [...document.querySelector('#prompts blockquote').closest('.grid').children]
    const first = panels[0].getBoundingClientRect(), last = panels[panels.length - 1].getBoundingClientRect()
    const box = (b) => { const r = b.getBoundingClientRect(); return { l: Math.round(r.left), r: Math.round(r.right), y: Math.round(r.top + r.height / 2) } }
    const sides = side.map(box)
    return {
      side: sides.length,
      row: row.length,
      inViewport: sides.every((s) => s.l >= 0 && s.r <= innerWidth),
      clearOfBoxes: side.every((b) => {
        const s = b.getBoundingClientRect()
        return s.right <= first.left + 1 || s.left >= last.right - 1
      }),
      centredOnBoxes: sides.every((s) => Math.abs(s.y - (first.top + first.height / 2)) < 3),
      positions: sides,
    }
  })
  // Next then previous must move the case forward and back.
  const act = () => p.evaluate(() => document.querySelector('#prompts [role="tab"][aria-selected="true"]').textContent.trim().slice(0, 2))
  const click = (l) => p.evaluate((label) => [...document.querySelectorAll(`#prompts button[aria-label="${label}"]`)].find((b) => b.getBoundingClientRect().width > 0).click(), l)
  const a = await act(); await click('Next prompt'); await new Promise((x) => setTimeout(x, 700))
  const b = await act(); await click('Previous prompt'); await new Promise((x) => setTimeout(x, 700))
  const c = await act()
  console.log(`arrows ${w}x${h}:`, JSON.stringify({ ...r, steps: `${a}→${b}→${c}` }))
  if (w === 1234) await p.screenshot({ path: `${out}/r8-prompts-1234.png` })
  await p.close()
}

// ------------------------------------------------------------------ contact
{
  const p = await open(1234, 900)
  await scrollToId(p, 'contact', 80)
  console.log('contact:', JSON.stringify(await p.evaluate(() => {
    const c = document.getElementById('contact')
    return {
      formGone: !c.querySelector('form, input, textarea') && !c.innerText.includes('Send a message'),
      index: [...c.querySelectorAll('.label')].map((e) => e.textContent.trim()).join(' '),
      email: c.innerText.includes('patelgopiii16@gmail.com'),
      phone: c.innerText.includes('6260301778'),
      socials: c.querySelectorAll('a[aria-label="GitHub"], a[aria-label="LinkedIn"]').length,
    }
  })))
  await (await p.$('#contact')).screenshot({ path: `${out}/r8-contact.png` })
  await p.close()
}

// -------------------------------------------------------------- back to top
for (const [w, h] of [[1234, 646], [390, 844]]) {
  const p = await open(w, h)
  const state = () => p.evaluate(() => {
    const b = document.querySelector('button[aria-label="Back to top"]')
    const r = b.getBoundingClientRect()
    return {
      visible: getComputedStyle(b).visibility === 'visible' && Number(getComputedStyle(b).opacity) > 0.5,
      y: Math.round(scrollY),
      corner: `${Math.round(innerWidth - r.right)}px from right, ${Math.round(innerHeight - r.bottom)}px from bottom`,
    }
  })
  const atTop = await state()
  for (let i = 0; i < 12; i++) { await p.mouse.wheel({ deltaY: 400 }); await new Promise((r) => setTimeout(r, 60)) }
  await new Promise((r) => setTimeout(r, 1200))
  const down = await state()
  if (w === 1234) await p.screenshot({ path: `${out}/r8-backtotop.png` })
  await p.click('button[aria-label="Back to top"]')
  await new Promise((r) => setTimeout(r, 2500))
  const after = await state()
  console.log(`back to top ${w}x${h}:`, JSON.stringify({ hiddenAtTop: !atTop.visible, shownAfterScroll: down.visible, scrolledFrom: down.y, landedAt: after.y, hiddenAgain: !after.visible, corner: down.corner }))
  await p.close()
}

await B.close()
