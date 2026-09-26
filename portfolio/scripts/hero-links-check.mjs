/**
 * The first screen: the nav resume button is back, the profile links sit
 * clear of the type and the marginalia, and nothing overflows.
 *
 *   node scripts/hero-links-check.mjs <screenshot-dir>
 */
import puppeteer from 'puppeteer-core'

const out = process.argv[2]
const B = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  args: ['--no-sandbox'],
})

const hit = (a, b) => a && b && a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1

for (const [w, h] of [[1440, 900], [1280, 720], [1024, 768], [1024, 640], [820, 1180], [390, 844], [360, 640]]) {
  const p = await B.newPage()
  await p.setViewport({ width: w, height: h })
  await p.goto('http://localhost:5180/', { waitUntil: 'domcontentloaded' })
  await p.evaluate(() => { history.scrollRestoration = 'manual'; scrollTo(0, 0) })
  await new Promise((r) => setTimeout(r, 2500))

  const r = await p.evaluate(() => {
    const home = document.getElementById('home')
    const box = (el) => { if (!el) return null; const b = el.getBoundingClientRect(); return { left: b.left, right: b.right, top: b.top, bottom: b.bottom } }
    const link = (t) => [...home.querySelectorAll('a')].find((a) => a.textContent.trim().startsWith(t))
    const li = link('LINKEDIN'), gh = link('GITHUB')
    const navResume = [...document.querySelectorAll('header a')].find((a) => a.textContent.includes('View resume'))
    const p2 = (t) => box([...home.querySelectorAll('p')].find((e) => e.textContent.includes(t)))
    return {
      links: { linkedin: !!li, github: !!gh, hrefs: [li?.getAttribute('href'), gh?.getAttribute('href')] },
      socials: li && gh ? { left: Math.min(li.getBoundingClientRect().left, gh.getBoundingClientRect().left), right: Math.max(li.getBoundingClientRect().right, gh.getBoundingClientRect().right), top: Math.min(li.getBoundingClientRect().top, gh.getBoundingClientRect().top), bottom: Math.max(li.getBoundingClientRect().bottom, gh.getBoundingClientRect().bottom) } : null,
      others: {
        name: box(home.querySelector('h1')),
        subtitle: box(home.querySelector('p[aria-hidden]')),
        projects: p2('PROJECTS BUILT'),
        clients: p2('CLIENT PROJECTS'),
        paper: box([...home.querySelectorAll('a')].find((a) => a.textContent.includes('RESEARCH PAPER'))),
        accepted: p2('ACCEPTED'),
        mca: p2('MCA ·'),
        nav: box(document.querySelector('header nav')),
      },
      navResume: { present: !!navResume, visible: (navResume?.getBoundingClientRect().width ?? 0) > 0 },
      navRowOverlap: (() => {
        const links = document.querySelector('header nav ul')
        const acts = document.querySelector('header nav ul + div')
        if (!links || !acts || links.getBoundingClientRect().width === 0) return 'stacked'
        const a = links.getBoundingClientRect(), b = acts.getBoundingClientRect()
        return a.right > b.left ? 'COLLIDES' : 'clear'
      })(),
      win: [innerWidth, innerHeight],
      overflow: document.documentElement.scrollWidth > innerWidth,
    }
  })

  const clashes = Object.entries(r.others).filter(([, b]) => hit(r.socials, b)).map(([k]) => k)
  const onScreen = r.socials && r.socials.top >= 0 && r.socials.bottom <= r.win[1] && r.socials.left >= 0 && r.socials.right <= r.win[0]
  console.log(`${w}x${h}:`, JSON.stringify({ ...r.links, onScreen, clashes: clashes.length ? clashes : 'none', navResume: r.navResume, nav: r.navRowOverlap, overflow: r.overflow }))
  await p.screenshot({ path: `${out}/hero-links-${w}x${h}.png` })
  await p.close()
}
await B.close()
