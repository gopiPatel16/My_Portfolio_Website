# Gopi Patel — portfolio

A project-first portfolio for AI Prompt Engineer / GenAI Workflow Specialist
roles. Dark, cinematic, evidence-led: every figure traces to a project source
tree, a technical report, or the research paper in `public/research/`.

## Running it

```bash
npm install
npm run dev
```

Production build and preview:

```bash
npm run build && npm run preview
```

## Structure

| Path | What it holds |
|---|---|
| `src/data/profile.ts` | Identity, navigation, headline figures |
| `src/data/projects.ts` | The ten projects — problem, idea, approach, result, AI workflow, architecture, screenshots |
| `src/data/ai.ts` | The seven-step workflow, capability groups, AI toolkit |
| `src/data/prompts.ts` | Prompt → model → output cases, with the real media each produced |
| `src/data/research.ts` | The ICCCNT paper, taken verbatim from the paper and acceptance email |
| `src/data/skills.ts` | Skills by category, and education |
| `src/components/FlowField.tsx` | The animated background — canvas strands and particles |
| `src/components/sections/` | One file per home-page section |
| `src/pages/ProjectPage.tsx` | The full case study at `/projects/:slug` |
| `public/shots/<slug>/` | Project screenshots |
| `public/prompts/` | Prompt outputs — four videos with WebP posters, plus stills |
| `public/reports/` | Nine project reports |
| `public/research/` | The paper and its acceptance letter |

**All content lives in `src/data/`.** Editing a project means editing one
object; no component changes.

### Why screenshots live in `/shots/` and not `/projects/`

`/projects/:slug` is a route. If the images sat at `/projects/<slug>/x.webp`,
the SPA rewrite would serve `index.html` for them — with a 200, so it would not
even look like an error. They are namespaced separately to make that impossible.

## Content rules

- No invented employment, clients, certifications, awards or statistics.
- No proficiency percentages — none were measured, so none are claimed.
- Every project metric is quoted from that project's report or counted from its
  source tree.
- The research section states **accepted**, not published: the supplied material
  is an acceptance email and a programme listing, and asserts nothing about
  indexing or a DOI. Gopi is the second of two authors, and both are named.
- Only the two social profiles that exist are linked.
- The contact form has no backend. It composes a `mailto:` draft and says so.

## Screenshots

Three projects were served from their build output and driven with headless
Chrome, so the screenshots are of the applications actually running. Those
carry a **CAPTURED LIVE** badge on the site.

```bash
node scripts/capture-projects.mjs   # Bharti, GK Master, GAMEVERSE
node scripts/capture-gk.mjs         # GK needs driving past its welcome gate
```

The remaining screenshots come from each project's own `docs/screenshots/`
directory or were extracted from its technical report. Nothing is mocked up.

Projects not captured live need services this machine does not have: Vault,
Operate and the Knowledge Assistant need PostgreSQL (and Qdrant / an API key);
Sugar Rush needs its Neon database; DocVault is an Android build.

## QA scripts

Development helpers driving local Chrome via `puppeteer-core`. Not part of the
build.

```bash
node scripts/shots.mjs http://localhost:5173/ 1440 900 <outDir>   # section screenshots
node scripts/audit.mjs                                            # links, 404s, alt text, headings, reduced motion
node scripts/routes.mjs                                           # every /projects/:slug route
node scripts/overflow.mjs                                         # horizontal overflow at 390px
```

`audit.mjs` checks response status as well as request failures — a 404 is a
*successful* response, so `requestfailed` alone never catches one.

## Design system

Tokens in `src/index.css` under `@theme`: `ink` (near-black to deep navy),
`paper` (type), and two accents — `azure` (electric blue) and `iris` (electric
purple). `.text-grad` and `.btn-grad` carry the one gradient; `.panel` is the
single card treatment. Space Grotesk for display, Inter for body, JetBrains Mono
for technical labels.

`FlowField` draws the background on canvas: strands sharing a flowing spine with
particles on the crest, easing toward the pointer. It pauses when scrolled out of
view, thins on small screens, caps DPR at 1.5, and renders one static frame under
`prefers-reduced-motion`.

### A trap worth knowing about

`body { overflow-x: hidden }` makes body a scroll container and silently breaks
every `position: sticky` on the page. Both `html` and `body` use `overflow-x:
clip`, which clips without creating a scroll container.

## Deployment

Static output. `vercel.json` handles the SPA rewrite for `/projects/:slug` and
sets immutable caching on `/assets`, `/img` and `/shots`.

```bash
npx vercel deploy --prod
```

Before going live, replace the `https://gopipatel.dev/` placeholder in
`index.html` — it appears in the canonical link, Open Graph, Twitter card and
the JSON-LD `Person` block.

`dist/` is around 25 MB, most of it the nine report PDFs and the four prompt
videos. Those are only fetched on demand, so they do not affect page load.
