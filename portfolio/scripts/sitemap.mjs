/**
 * Writes public/sitemap.xml from the project data, so robots.txt points at a
 * file that exists and lists every route the router can serve.
 *
 *   node scripts/sitemap.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const SITE = 'https://portfolio-website-acerme.vercel.app'

// Read the slugs out of the data file rather than importing it: projects.ts is
// TypeScript, and this script has no build step.
const data = fs.readFileSync(path.join(ROOT, 'src/data/projects.ts'), 'utf8')
const slugs = [...data.matchAll(/^\s{4}slug: '([a-z0-9-]+)',$/gm)].map((m) => m[1])
if (!slugs.length) throw new Error('no project slugs found in src/data/projects.ts')

const today = new Date().toISOString().slice(0, 10)
const url = (loc, priority) =>
  `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${today}</lastmod>\n    <priority>${priority}</priority>\n  </url>`

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  url(`${SITE}/`, '1.0'),
  ...slugs.map((s) => url(`${SITE}/projects/${s}`, '0.8')),
  '</urlset>',
  '',
].join('\n')

const out = path.join(ROOT, 'public/sitemap.xml')
fs.writeFileSync(out, xml)
console.log(`wrote ${path.relative(ROOT, out)} — ${slugs.length + 1} urls (${slugs.join(', ')})`)
