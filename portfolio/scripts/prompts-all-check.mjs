/**
 * Clicks through every prompt case and checks each one actually works:
 *  - the prompt text is present and keeps its line breaks;
 *  - the prompt box and output box are one standard size, identical for every case;
 *  - the output media loads and sits wholly inside its box;
 *  - the Copy button puts the full prompt on the clipboard;
 *  - the wheel over a long prompt scrolls the prompt, not the page;
 *  - no /prompts/ request fails and nothing overflows sideways.
 *
 *   node scripts/prompts-all-check.mjs <screenshot-dir> [width]
 */
import puppeteer from 'puppeteer-core'

const out = process.argv[2]
const width = Number(process.argv[3] || 1440)
const ORIGIN = 'http://localhost:5180'
const B = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'],
})
await B.defaultBrowserContext().overridePermissions(ORIGIN, ['clipboard-read', 'clipboard-write', 'clipboard-sanitized-write'])
const p = await B.newPage()
await p.setViewport({ width, height: 900 })
const bad = []
p.on('response', (r) => { if (r.status() >= 400 && r.url().includes('/prompts/')) bad.push(`${r.status()} ${r.url()}`) })
p.on('pageerror', (e) => bad.push(`pageerror ${String(e).slice(0, 160)}`))

await p.goto(`${ORIGIN}/`, { waitUntil: 'domcontentloaded' })
await new Promise((r) => setTimeout(r, 2000))
for (let n = 0; n < 200; n++) {
  if (await p.evaluate(() => document.getElementById('prompts').getBoundingClientRect().top < 60)) break
  await p.mouse.wheel({ deltaY: 320 })
  await new Promise((r) => setTimeout(r, 40))
}
await new Promise((r) => setTimeout(r, 1500))

const total = await p.evaluate(() => document.querySelectorAll('#prompts [data-chip]').length)
const rows = []
for (let i = 0; i < total; i++) {
  await p.evaluate((k) => document.querySelector(`#prompts [data-chip="${k}"]`).click(), i)
  await new Promise((r) => setTimeout(r, 900))
  const row = await p.evaluate(async () => {
    const q = document.getElementById('prompts')
    const [promptBox, outputBox] = [...q.querySelectorAll('.grid > .panel')]
    const quote = promptBox.querySelector('blockquote')
    const img = outputBox.querySelector('img')
    const video = outputBox.querySelector('video')
    let media = 'none'
    const el = img || video
    if (img) {
      if (!img.complete) await new Promise((res) => { img.onload = res; img.onerror = res; setTimeout(res, 4000) })
      media = img.naturalWidth > 0 ? `img ${img.naturalWidth}x${img.naturalHeight}` : 'IMG FAILED'
    } else if (video) {
      try { await video.play() } catch { /* readyState below is the real signal */ }
      const t0 = performance.now()
      while (video.readyState < 2 && performance.now() - t0 < 6000) await new Promise((r) => setTimeout(r, 100))
      media = video.readyState >= 2 ? `video ${video.videoWidth}x${video.videoHeight}` : 'VIDEO NOT LOADED'
    }
    const ob = outputBox.getBoundingClientRect()
    const mb = el?.getBoundingClientRect()
    // The box around the media must have the media's own proportions.
    const area = el?.parentElement.getBoundingClientRect()
    const nw = img ? img.naturalWidth : video?.videoWidth
    const nh = img ? img.naturalHeight : video?.videoHeight
    return {
      fills: !!area && nh > 0 && Math.abs(area.width / area.height - nw / nh) < 0.012,
      portrait: nh > nw,
      title: q.querySelector('[role="tab"][aria-selected="true"]')?.textContent.trim(),
      model: q.querySelector('.grid .text-center p')?.textContent,
      chars: quote.textContent.length,
      preWrap: getComputedStyle(quote).whiteSpace === 'pre-wrap',
      promptH: Math.round(promptBox.getBoundingClientRect().height),
      outputH: Math.round(ob.height),
      mediaInside: !!mb && mb.top >= ob.top - 1 && mb.bottom <= ob.bottom + 1 && mb.left >= ob.left - 1 && mb.right <= ob.right + 1,
      fit: el ? getComputedStyle(el).objectFit : '',
      media,
      docW: document.documentElement.scrollWidth,
    }
  })
  rows.push(row)
  console.log(`${String(i + 1).padStart(2, '0')} ${row.title?.slice(2, 44).padEnd(43)} ${String(row.chars).padStart(5)}ch | ${row.portrait ? 'portrait ' : 'landscape'} box ${row.outputH}px, prompt ${row.promptH}px | ${row.fills ? 'fills' : 'DOES NOT FILL'} | ${row.model} | ${row.media}`)
}

// Copy button: clipboard must hold exactly the full prompt text.
const copyResult = []
for (const i of [0, rows.length - 1]) {
  await p.evaluate((k) => document.querySelector(`#prompts [data-chip="${k}"]`).click(), i)
  await new Promise((r) => setTimeout(r, 900))
  const expected = await p.evaluate(() => document.querySelector('#prompts blockquote').textContent)
  const btn = await p.evaluateHandle(() => [...document.querySelectorAll('#prompts button')].find((b) => b.textContent.includes('COPY')))
  await btn.click()
  await new Promise((r) => setTimeout(r, 400))
  const state = await p.evaluate(() => ({
    label: [...document.querySelectorAll('#prompts button')].find((b) => /COP/.test(b.textContent))?.textContent,
    status: document.querySelector('#prompts [role="status"]')?.textContent,
    clip: navigator.clipboard.readText(),
  }))
  const clip = await p.evaluate(() => navigator.clipboard.readText())
  // The Windows clipboard stores line breaks as CRLF, so compare with those
  // normalised; otherwise every multi-line prompt reports a false mismatch.
  copyResult.push({ case: i + 1, label: state.label, status: state.status, matches: clip.replace(/\r\n/g, '\n') === expected, chars: clip.length })
}
console.log('\ncopy button:', JSON.stringify(copyResult))

// The wheel over a scrolling prompt must scroll the prompt, not the page.
const longest = rows.reduce((m, r, i) => (r.chars > rows[m].chars ? i : m), 0)
await p.evaluate((k) => document.querySelector(`#prompts [data-chip="${k}"]`).click(), longest)
await new Promise((r) => setTimeout(r, 900))
const box = await p.evaluate(() => {
  const b = document.querySelector('#prompts blockquote').getBoundingClientRect()
  return { x: b.left + b.width / 2, y: b.top + Math.min(b.height / 2, 200) }
})
const before = await p.evaluate(() => ({ page: Math.round(scrollY), quote: document.querySelector('#prompts blockquote').scrollTop }))
await p.mouse.move(box.x, box.y)
for (let i = 0; i < 4; i++) { await p.mouse.wheel({ deltaY: 200 }); await new Promise((r) => setTimeout(r, 120)) }
await new Promise((r) => setTimeout(r, 900))
const after = await p.evaluate(() => ({ page: Math.round(scrollY), quote: document.querySelector('#prompts blockquote').scrollTop }))
console.log('wheel over longest prompt:', JSON.stringify({ promptScrolled: after.quote > before.quote, pageMoved: Math.abs(after.page - before.page) > 40 }))

await p.evaluate(() => document.querySelector('#prompts blockquote').scrollTo(0, 0))
for (const shot of [0, rows.findIndex((r) => /REPTILE|tagline/i.test(r.title || ''))]) {
  if (shot < 0) continue
  await p.evaluate((k) => document.querySelector(`#prompts [data-chip="${k}"]`).click(), shot)
  await new Promise((r) => setTimeout(r, 1200))
  // The section header is also a grid, so anchor on the prompt box to find the case grid.
  const grid = await p.evaluateHandle(() => document.querySelector('#prompts blockquote').closest('.grid'))
  await grid.screenshot({ path: `${out}/prompts-${width}-case${shot + 1}.png` })
}

const failures = rows.filter((r) => /FAILED|NOT LOADED|none/.test(r.media) || r.chars < 40 || !r.preWrap || !r.mediaInside || !r.fills)
const mismatched = rows.filter((r) => Math.abs(r.promptH - r.outputH) > 1)
console.log('cases:', rows.length, '| failures:', failures.length ? failures.map((f) => f.title) : 'none')
console.log('prompt box height matches output box:', width < 1024 ? 'n/a (stacked on narrow screens)' : mismatched.length ? `MISMATCH: ${mismatched.map((r) => r.title).join(', ')}` : 'every case')
console.log('horizontal overflow:', rows.some((r) => r.docW > width) ? 'YES' : 'none')
console.log('bad requests:', bad.length ? bad : 'none')
await B.close()
