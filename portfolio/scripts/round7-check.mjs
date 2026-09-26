/**
 * Checks the annotated round of changes on the live page:
 * project filters, removed banner and closing line, prompt arrows, merged
 * toolkit section, and the hero's four corners (content and no overlaps).
 *
 *   node scripts/round7-check.mjs <screenshot-dir>
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

async function scrollToId(p, id) {
  for (let n = 0; n < 260; n++) {
    const top = await p.evaluate((s) => document.getElementById(s).getBoundingClientRect().top, id)
    if (Math.abs(top) < 40) break
    await p.mouse.wheel({ deltaY: top > 0 ? Math.min(500, top) : Math.max(-500, top) })
    await new Promise((r) => setTimeout(r, 40))
  }
  await new Promise((r) => setTimeout(r, 1200))
}

const overlap = (a, b) => a && b && a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom

// ---------------------------------------------------------------- hero corners
for (const [w, h] of [[1440, 900], [1004, 646], [390, 844]]) {
  const p = await open(w, h)
  const r = await p.evaluate(() => {
    const home = document.getElementById('home')
    const box = (el) => { if (!el) return null; const b = el.getBoundingClientRect(); return { left: b.left, right: b.right, top: b.top, bottom: b.bottom } }
    const find = (t) => [...home.querySelectorAll('p, a')].find((e) => e.textContent.trim().startsWith(t))
    const block = (t) => find(t)?.closest('div')
    return {
      text: home.innerText,
      mca: box(block('MCA')),
      bca: box(block('BCA')),
      projects: box(block(/\d/.test('') ? '' : document.querySelector('#home p') && [...home.querySelectorAll('p')].find((e) => /PROJECTS BUILT/.test(e.textContent))?.textContent.trim())),
      paper: box(find('RESEARCH PAPER')?.closest('div')),
      name: box(home.querySelector('h1 span[aria-hidden]')),
      subtitle: box(home.querySelector('p[aria-hidden]')),
      nav: box(document.querySelector('header nav')),
      win: [innerWidth, innerHeight],
      docW: document.documentElement.scrollWidth,
    }
  })
  const items = { mca: r.mca, bca: r.bca, projects: r.projects, paper: r.paper }
  const clashes = []
  for (const [k, v] of Object.entries(items)) {
    for (const [o, ob] of Object.entries({ name: r.name, subtitle: r.subtitle, nav: r.nav })) if (overlap(v, ob)) clashes.push(`${k}×${o}`)
    if (!v || v.top < 0 || v.bottom > r.win[1] + 1) clashes.push(`${k} off-screen`)
  }
  console.log(`hero ${w}x${h}:`, JSON.stringify({
    corners: Object.fromEntries(Object.entries(items).map(([k, v]) => [k, v && `${Math.round(v.left)},${Math.round(v.top)}`])),
    hasEducation: /MCA · 2025/.test(r.text) && /BCA · 2023/.test(r.text) && /MANIPAL INSTITUTE OF TECHNOLOGY/.test(r.text) && /MAHARAJA AGRASEN COLLEGE/.test(r.text),
    roleLabelGone: !/AI PROMPT ENGINEER — CLAUDE CODE/.test(r.text),
    clashes: clashes.length ? clashes : 'none',
    overflow: r.docW > r.win[0],
  }))
  await p.screenshot({ path: `${out}/r7-hero-${w}.png` })
  await p.close()
}

// ---------------------------------------------------------- page-wide content
{
  const p = await open(1440, 900)
  console.log('page:', JSON.stringify(await p.evaluate(() => ({
    bannerGone: !document.body.innerText.includes('HAVE A PROJECT IN MIND'),
    closingLineGone: !document.body.innerText.includes('The pattern in all of them'),
    skillsSectionGone: !document.getElementById('skills') && ![...document.querySelectorAll('section')].some((s) => s.innerText.includes('Everything here is in a shipped project')),
    sectionOrder: [...document.querySelectorAll('main > section')].map((s) => s.id || '-').join(' > '),
  }))))

  // Project filters
  await scrollToId(p, 'work')
  const filters = await p.evaluate(() => [...document.querySelectorAll('#work button')].map((b) => b.textContent.trim()).filter((t) => /^(All Projects|Web|Software|AI)/.test(t)))
  const counts = {}
  for (const f of filters) {
    await p.evaluate((label) => [...document.querySelectorAll('#work button')].find((b) => b.textContent.trim() === label).click(), f)
    await new Promise((r) => setTimeout(r, 700))
    counts[f] = await p.evaluate(() => {
      const kinds = [...document.querySelectorAll('#work article')].map((a) => a.querySelector('p')?.textContent.trim())
      const pages = [...document.querySelectorAll('#work nav button')].filter((b) => /^\d+$/.test(b.textContent.trim())).length || 1
      return { shownOnPage: kinds.length, pages, categories: [...new Set(kinds)] }
    })
  }
  console.log('filters:', JSON.stringify(filters), JSON.stringify(counts))
  console.log('no "AI & GENAI" in projects:', !(await p.evaluate(() => document.getElementById('work').innerText.includes('AI & GENAI'))))
  await p.evaluate(() => [...document.querySelectorAll('#work button')].find((b) => b.textContent.trim() === 'All Projects').click())
  await new Promise((r) => setTimeout(r, 600))
  await (await p.$('#work')).screenshot({ path: `${out}/r7-work.png`, clip: undefined })

  // Prompt arrows
  await scrollToId(p, 'prompts')
  const active = () => p.evaluate(() => document.querySelector('#prompts [role="tab"][aria-selected="true"]')?.textContent.trim().slice(0, 2))
  const side = await p.evaluate(() => [...document.querySelectorAll('#prompts button[aria-label="Next prompt"], #prompts button[aria-label="Previous prompt"]')]
    .map((b) => { const r = b.getBoundingClientRect(); return { label: b.getAttribute('aria-label'), visible: r.width > 0 && getComputedStyle(b).display !== 'none', left: Math.round(r.left), right: Math.round(r.right), top: Math.round(r.top) } }))
  const clickArrow = (label) => p.evaluate((l) => [...document.querySelectorAll(`#prompts button[aria-label="${l}"]`)].find((b) => b.getBoundingClientRect().width > 0).click(), label)
  const seq = [await active()]
  await clickArrow('Next prompt'); await new Promise((r) => setTimeout(r, 700)); seq.push(await active())
  await clickArrow('Next prompt'); await new Promise((r) => setTimeout(r, 700)); seq.push(await active())
  await clickArrow('Previous prompt'); await new Promise((r) => setTimeout(r, 700)); seq.push(await active())
  await clickArrow('Previous prompt'); await new Promise((r) => setTimeout(r, 700))
  await clickArrow('Previous prompt'); await new Promise((r) => setTimeout(r, 700)); seq.push(await active())
  console.log('prompt arrows 1440:', JSON.stringify({ visibleArrows: side.filter((s) => s.visible), sequence: seq.join(' → '), inViewport: side.filter((s) => s.visible).every((s) => s.left >= 0 && s.right <= 1440) }))
  await clickArrow('Next prompt'); await new Promise((r) => setTimeout(r, 1200))
  await p.evaluate(() => scrollBy(0, -40))
  await p.screenshot({ path: `${out}/r7-prompts.png` })

  // Toolkit
  await scrollToId(p, 'toolkit')
  console.log('toolkit:', JSON.stringify(await p.evaluate(() => {
    const t = document.getElementById('toolkit')
    return {
      label: t.querySelector('.label, p')?.textContent.trim(),
      title: t.querySelector('h2')?.textContent.trim(),
      techniques: !!t.querySelector('[aria-label="Skill categories"]'),
      tabs: t.querySelectorAll('[aria-label="Skill categories"] [role="tab"]').length,
    }
  })))
  await (await p.$('#toolkit')).screenshot({ path: `${out}/r7-toolkit.png` })
  await p.close()
}

// Prompt arrows below xl: the row underneath is the working control.
for (const w of [1024, 390]) {
  const p = await open(w, 900)
  await scrollToId(p, 'prompts')
  const r = await p.evaluate(() => {
    const vis = [...document.querySelectorAll('#prompts button[aria-label="Next prompt"]')].filter((b) => b.getBoundingClientRect().width > 0)
    const before = document.querySelector('#prompts [role="tab"][aria-selected="true"]').textContent.trim().slice(0, 2)
    vis[0]?.click()
    return { visibleNext: vis.length, before }
  })
  await new Promise((res) => setTimeout(res, 700))
  const after = await p.evaluate(() => document.querySelector('#prompts [role="tab"][aria-selected="true"]').textContent.trim().slice(0, 2))
  const docW = await p.evaluate(() => document.documentElement.scrollWidth)
  console.log(`prompt arrows ${w}:`, JSON.stringify({ ...r, after, overflow: docW > w }))
  await p.close()
}

await B.close()
