/**
 * Serves each runnable project's build output and drives it with headless
 * Chrome, capturing real screenshots of the running application.
 *
 *   node scripts/capture-projects.mjs
 *
 * Output lands in scripts/.captures/<slug>/ as PNGs, which capture-optimise.mjs
 * then converts into the WebP assets the site actually ships.
 */
import http from 'node:http'
import { createReadStream, existsSync, statSync, mkdirSync } from 'node:fs'

import path from 'node:path'
import puppeteer from 'puppeteer-core'

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const OUT = path.resolve('scripts/.captures')
const ROOT = 'E:/Profile Portfolio/projects'

const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.avif': 'image/avif', '.ico': 'image/x-icon',
  '.mp4': 'video/mp4', '.webm': 'video/webm', '.woff2': 'font/woff2',
  '.woff': 'font/woff', '.ttf': 'font/ttf', '.pdf': 'application/pdf',
  '.wasm': 'application/wasm', '.txt': 'text/plain', '.map': 'application/json',
}

/** Static file server with SPA fallback, so client-side routes resolve. */
function serve(dir, port, spa = true) {
  const server = http.createServer((req, res) => {
    const url = decodeURIComponent((req.url || '/').split('?')[0])
    let file = path.join(dir, url)
    try {
      if (existsSync(file) && statSync(file).isDirectory()) file = path.join(file, 'index.html')
      if (!existsSync(file)) {
        if (!spa) { res.writeHead(404); return res.end('not found') }
        file = path.join(dir, 'index.html')
      }
      res.writeHead(200, {
        'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream',
        'Cache-Control': 'no-store',
      })
      createReadStream(file).pipe(res)
    } catch {
      res.writeHead(500); res.end('error')
    }
  })
  return new Promise((resolve) => server.listen(port, () => resolve(server)))
}

/** Projects whose build output can be served and driven as-is. */
const TARGETS = [
  {
    slug: 'bharti-engineering',
    dir: `${ROOT}/Bharti_engineering/Bharti_engineering`,
    port: 7101,
    spa: false,
    settle: 2600,
    shots: [
      { name: 'hero', scrollTo: 0 },
      { name: 'profile', scrollTo: 900 },
      { name: 'services', scrollTo: 1900 },
      { name: 'why-us', scrollTo: 3000 },
      { name: 'contact', scrollTo: 4200 },
      { name: 'mobile-hero', scrollTo: 0, viewport: [390, 844] },
    ],
  },
  {
    slug: 'gk-master',
    dir: `${ROOT}/GK/dist`,
    port: 7102,
    spa: true,
    settle: 3000,
    viewport: [430, 900],
    shots: [
      { name: 'home', route: '/' },
      { name: 'practice', route: '/practice' },
      { name: 'progress', route: '/progress' },
      { name: 'settings', route: '/settings' },
    ],
  },
  {
    slug: 'gameverse',
    dir: `${ROOT}/GAMEVERSE/GAMEVERSE/dist`,
    port: 7103,
    spa: true,
    settle: 4200,
    shots: [
      { name: 'portal', route: '/' },
      { name: 'god-of-war', route: '/god-of-war' },
      { name: 'god-of-war-story', route: '/god-of-war', scrollTo: 1100 },
      { name: 'mortal-kombat', route: '/mortal-kombat' },
      { name: 'mortal-kombat-fighters', route: '/mortal-kombat', scrollTo: 1200 },
      { name: 'valorant', route: '/valorant' },
      { name: 'valorant-agents', route: '/valorant', scrollTo: 1200 },
      { name: 'mobile-portal', route: '/', viewport: [390, 844] },
    ],
  },
]

const log = []

for (const t of TARGETS) {
  if (!existsSync(t.dir)) { log.push(`SKIP ${t.slug} — no ${t.dir}`); continue }
  mkdirSync(path.join(OUT, t.slug), { recursive: true })

  const server = await serve(t.dir, t.port, t.spa)
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--hide-scrollbars', '--autoplay-policy=no-user-gesture-required', '--mute-audio'],
    defaultViewport: { width: t.viewport?.[0] ?? 1440, height: t.viewport?.[1] ?? 900 },
  })

  const errs = []
  for (const shot of t.shots) {
    const page = await browser.newPage()
    page.on('pageerror', (e) => errs.push(`${shot.name}: ${String(e.message).slice(0, 110)}`))
    const [w, h] = shot.viewport ?? t.viewport ?? [1440, 900]
    await page.setViewport({ width: w, height: h, deviceScaleFactor: 2 })
    try {
      await page.goto(`http://localhost:${t.port}${shot.route ?? '/'}`, {
        waitUntil: 'networkidle2', timeout: 45000,
      })
      await new Promise((r) => setTimeout(r, t.settle))
      if (shot.scrollTo) {
        await page.evaluate((y) => {
          document.documentElement.style.scrollBehavior = 'auto'
          window.scrollTo(0, y)
        }, shot.scrollTo)
        await new Promise((r) => setTimeout(r, 1800))
      }
      const file = path.join(OUT, t.slug, `${shot.name}.png`)
      await page.screenshot({ path: file })
      log.push(`OK   ${t.slug}/${shot.name} ${w}x${h}`)
    } catch (e) {
      log.push(`FAIL ${t.slug}/${shot.name} — ${String(e.message).slice(0, 90)}`)
    }
    await page.close()
  }

  await browser.close()
  server.close()
  if (errs.length) log.push(`  page errors: ${[...new Set(errs)].slice(0, 3).join(' | ')}`)
}

console.log(log.join('\n'))
