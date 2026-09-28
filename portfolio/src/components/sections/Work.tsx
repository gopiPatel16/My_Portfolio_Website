import { AnimatePresence, motion } from 'motion/react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  ArrowUpRight,
  Camera,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Code2,
  FileText,
  LayoutGrid,
  Monitor,
  Rows3,
  Server,
} from 'lucide-react'
import { CATEGORIES, projects, type Project } from '../../data/projects'
import { usePdfPreview } from '../pdf-preview-context'
import { Reveal } from '../primitives'
import { ScrubThumb } from '../ScrubThumb'
import { useReducedMotion } from '../../hooks'

const PER_PAGE = 6

const FILTER_ICONS: Record<string, typeof LayoutGrid> = {
  All: LayoutGrid,
  Web: Monitor,
  Software: Server,
}

const SORTS = ['Featured first', 'A – Z', 'Most documented'] as const

/** Two-letter marks stand in for logos; no vendor artwork is invented. */
const MARK: Record<string, string> = {
  'Python 3.12': 'Py', Python: 'Py', TypeScript: 'TS', JavaScript: 'JS',
  'React 19': 'Re', 'React 18': 'Re', React: 'Re', 'Next.js 16': 'Nx', 'Next.js 14': 'Nx',
  FastAPI: 'Fa', LangGraph: 'LG', 'OpenAI SDK': 'AI', Qdrant: 'Qd',
  'PostgreSQL 16': 'Pg', PostgreSQL: 'Pg', 'SQLite (WAL)': 'Sq', Prisma: 'Pr',
  NestJS: 'Ne', 'Fastify 5': 'Ff', Fastify: 'Ff', 'Flutter 3.47': 'Fl',
  'Dart 3.13': 'Dt', Kotlin: 'Kt', 'Vite 6': 'Vi', 'Vite 5': 'Vi', Vite: 'Vi',
  'TailwindCSS v4': 'Tw', TailwindCSS: 'Tw', HTML5: 'Ht', CSS3: 'Cs',
  'Vanilla JavaScript': 'JS', 'Docker Compose': 'Dk', 'Canvas 2D': 'Cv',
  'Three.js': '3J', FFmpeg: 'FF', Vercel: 'Vc', Neon: 'Nn',
}
const mark = (t: string) => MARK[t] ?? t.slice(0, 2)

/* ------------------------------------------------------------------ *
 * Header artwork — an isometric cube with orbiting tech
 * ------------------------------------------------------------------ */

function ProjectsArt() {
  const reduced = useReducedMotion()
  const pills = [
    { label: 'LangGraph', x: '2%', y: '30%', d: 0 },
    { label: 'React', x: '-4%', y: '58%', d: 0.6 },
    { label: 'FastAPI', x: '72%', y: '16%', d: 1.2 },
    { label: 'PostgreSQL', x: '74%', y: '68%', d: 1.8 },
  ]

  return (
    <div className="relative mx-auto aspect-[5/4] w-full max-w-lg">
      {/* Orbit rings */}
      <svg viewBox="0 0 400 320" className="absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <radialGradient id="glow" cx="50%" cy="45%">
            <stop offset="0%" stopColor="#4c6fff" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#4c6fff" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="cubeA" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#6b8fff" />
            <stop offset="100%" stopColor="#3355e6" />
          </linearGradient>
          <linearGradient id="cubeB" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#4c6fff" />
          </linearGradient>
          <linearGradient id="cubeC" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#7132e0" />
          </linearGradient>
        </defs>

        <circle cx="200" cy="150" r="130" fill="url(#glow)" />
        <ellipse
          cx="200" cy="150" rx="150" ry="60"
          fill="none" stroke="rgba(139,92,246,0.28)" strokeWidth="1" strokeDasharray="3 6"
          transform="rotate(-18 200 150)"
        />
        <ellipse
          cx="200" cy="150" rx="120" ry="122"
          fill="none" stroke="rgba(76,111,255,0.18)" strokeWidth="1" strokeDasharray="3 7"
        />

        {/* Isometric cube */}
        <g transform="translate(200 150)">
          <path d="M0,-70 L62,-35 L0,0 L-62,-35 Z" fill="url(#cubeA)" opacity="0.95" />
          <path d="M-62,-35 L0,0 L0,70 L-62,35 Z" fill="url(#cubeB)" opacity="0.85" />
          <path d="M62,-35 L62,35 L0,70 L0,0 Z" fill="url(#cubeC)" opacity="0.9" />
          <path
            d="M0,-70 L62,-35 L0,0 L-62,-35 Z M-62,-35 L0,0 L0,70 L-62,35 Z M62,-35 L62,35 L0,70 L0,0 Z"
            fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="1"
          />
        </g>

        {/* Orbiting nodes */}
        {[
          [58, 52], [342, 78], [352, 214], [70, 236], [200, 22], [200, 292],
        ].map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r={i % 2 ? 4.5 : 6} fill={i % 2 ? '#a855f7' : '#4c6fff'}>
            {!reduced && (
              <animate
                attributeName="opacity"
                values="0.35;1;0.35"
                dur={`${2.6 + i * 0.35}s`}
                repeatCount="indefinite"
              />
            )}
          </circle>
        ))}
      </svg>

      {/* The code mark, centred on the cube */}
      <span
        aria-hidden
        className="absolute left-1/2 top-[47%] -translate-x-1/2 -translate-y-1/2 text-white/90"
      >
        <Code2 size={30} strokeWidth={2.2} />
      </span>

      {/* Floating technology pills */}
      {pills.map((p) => (
        <span
          key={p.label}
          className="absolute rounded-xl border border-[var(--edge-strong)] bg-ink-850/90 px-3 py-1.5 text-[11.5px] text-paper-200 shadow-[0_10px_30px_-14px_rgba(0,0,0,1)] backdrop-blur"
          style={{
            left: p.x,
            top: p.y,
            animation: reduced ? undefined : `float-y 5.5s ease-in-out ${p.d}s infinite`,
          }}
        >
          <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-linear-to-br from-azure-400 to-iris-400 align-middle" />
          {p.label}
        </span>
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ *
 * Card
 * ------------------------------------------------------------------ */

function ProjectCard({ project, list = false }: { project: Project; list?: boolean }) {
  const preview = usePdfPreview()

  return (
    <article
      className={`panel panel-hover group overflow-hidden ${list ? 'sm:flex' : 'flex h-full flex-col'}`}
      data-cursor="view"
    >
      <div
        className={`relative overflow-hidden border-[var(--edge)] ${
          list ? 'h-44 shrink-0 border-b sm:h-auto sm:w-64 sm:border-b-0 sm:border-r' : 'h-44 border-b'
        }`}
      >
        <ScrubThumb project={project} className="absolute inset-0">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-[1]"
            style={{ background: 'linear-gradient(180deg, rgba(8,7,20,0.05) 0%, rgba(5,4,13,0.55) 68%, rgba(5,4,13,0.9) 100%)' }}
          />
          {/* The whole thumbnail opens the deployed site. The case-study link
              below already covers the case study, so no corner button here. */}
          {project.live && (
            <a
              href={project.live}
              target="_blank"
              rel="noreferrer noopener"
              aria-label={`Open the live ${project.name} website in a new tab`}
              className="absolute inset-0 z-10 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-iris-400"
            >
              <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-lg border border-[var(--edge-strong)] bg-ink-950/75 px-2.5 py-1 font-mono text-[9.5px] tracking-[0.12em] text-paper-200 opacity-0 backdrop-blur transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100">
                OPEN SITE
                <ArrowUpRight size={11} strokeWidth={2.2} />
              </span>
            </a>
          )}
          {project.liveCaptured && (
            <span className="absolute left-3 top-3 z-20 inline-flex items-center gap-1.5 rounded-full border border-azure-500/40 bg-azure-500/15 px-2.5 py-1 font-mono text-[9px] tracking-[0.14em] text-azure-400 backdrop-blur">
              <Camera size={9} strokeWidth={2.2} />
              LIVE CAPTURE
            </span>
          )}
        </ScrubThumb>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="font-mono text-[10px] tracking-[0.16em] text-azure-400">
          {project.category.toUpperCase()}
        </p>
        <h3 className="display mt-2 text-[16.5px] text-paper-50 transition-colors group-hover:text-iris-300">
          {project.name}
        </h3>
        <p className="mt-2 flex-1 text-[12.5px] leading-relaxed text-paper-400">
          {project.tagline}
        </p>

        {/* Technology marks */}
        <ul className="mt-4 flex items-center gap-1.5">
          {project.stack.slice(0, 3).map((t) => (
            <li
              key={t}
              title={t}
              className="grid h-7 w-7 place-items-center rounded-lg border border-[var(--edge)] bg-iris-500/10 font-mono text-[10px] text-iris-300"
            >
              {mark(t)}
            </li>
          ))}
          {project.stack.length > 3 && (
            <li
              title={project.stack.slice(3).join(', ')}
              className="grid h-7 w-7 place-items-center rounded-lg border border-[var(--edge)] text-[11px] text-paper-600"
            >
              ···
            </li>
          )}
        </ul>

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-[var(--edge)] pt-4">
          <Link
            to={`/projects/${project.slug}`}
            className="group/l inline-flex items-center gap-1.5 text-[12.5px] text-paper-200 transition-colors hover:text-paper-50"
          >
            View Case Study
            <ArrowRight size={12} strokeWidth={2.2} className="transition-transform duration-300 group-hover/l:translate-x-1" />
          </Link>

          {/* A report is the closest thing to a live link that actually exists. */}
          {project.report ? (
            <a
              href={project.report}
              target="_blank"
              rel="noreferrer noopener"
              onClick={preview({
                src: project.report,
                title: `${project.name} — technical report`,
              })}
              className="inline-flex items-center gap-1.5 rounded-full border border-[var(--edge)] px-2.5 py-1 text-[11px] text-paper-400 transition-colors hover:border-iris-400 hover:text-paper-50"
            >
              <FileText size={11} strokeWidth={1.9} />
              Report
              <ArrowUpRight size={10} strokeWidth={2.2} />
            </a>
          ) : (
            <span className="font-mono text-[10px] tracking-[0.12em] text-paper-800">
              {project.year}
            </span>
          )}
        </div>
      </div>
    </article>
  )
}

/* ------------------------------------------------------------------ */

/** Counts in the standfirst come from the data, so they cannot drift. */
const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
  'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty']
const word = (n: number) => WORDS[n] ?? String(n)
/** Same, capitalised — for the start of a sentence. */
const Word = (n: number) => {
  const w = word(n)
  return w.charAt(0).toUpperCase() + w.slice(1)
}
const withReport = projects.filter((p) => p.report).length
const fromRunningApp = projects.filter((p) => p.liveCaptured).length

export function Work() {
  const [filter, setFilter] = useState<(typeof CATEGORIES)[number]>('All')
  const [sort, setSort] = useState<(typeof SORTS)[number]>('Featured first')
  const [sortOpen, setSortOpen] = useState(false)
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [page, setPage] = useState(1)
  const reduced = useReducedMotion()

  const filtered = useMemo(() => {
    const base = filter === 'All' ? projects : projects.filter((p) => p.category === filter)
    const sorted = [...base]
    if (sort === 'A – Z') sorted.sort((a, b) => a.name.localeCompare(b.name))
    else if (sort === 'Most documented') sorted.sort((a, b) => Number(!!b.report) - Number(!!a.report))
    else sorted.sort((a, b) => Number(!!b.featured) - Number(!!a.featured))
    return sorted
  }, [filter, sort])

  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const current = Math.min(page, pages)
  const shown = filtered.slice((current - 1) * PER_PAGE, current * PER_PAGE)

  const choose = (c: (typeof CATEGORIES)[number]) => {
    setFilter(c)
    setPage(1)
  }

  return (
    <section id="work" className="relative scroll-mt-24 py-20 md:py-28">
      <div className="shell">
        {/* ---------------- Header ---------------- */}
        <div className="grid items-center gap-x-12 gap-y-12 lg:grid-cols-12">
          <div className="min-w-0 lg:col-span-6">
            <Reveal>
              <p className="font-mono text-[11px] tracking-[0.22em] text-iris-400">MY WORK</p>
            </Reveal>
            <Reveal delay={0.05}>
              <h2 className="display mt-4 text-[clamp(2.4rem,5.4vw,4rem)] text-paper-50">
                My <span className="text-grad">Projects</span>
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-5 max-w-[46ch] text-[14.5px] leading-relaxed text-paper-400">
                {Word(projects.length)} projects across GenAI, web and software — each with a full
                case study, and {word(withReport)} with a technical report behind them.{' '}
                {Word(fromRunningApp)} were captured from the applications running.
              </p>
            </Reveal>
            <Reveal delay={0.15}>
              <div className="mt-8 flex flex-wrap items-center gap-5">
                <a
                  href="#work-grid"
                  className="btn-grad group inline-flex items-center gap-2.5 rounded-full px-6 py-3 text-sm font-medium text-white transition-transform duration-300 hover:-translate-y-0.5"
                >
                  View All Projects
                  <ArrowRight size={15} strokeWidth={2.2} className="transition-transform duration-300 group-hover:translate-x-1" />
                </a>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.1} className="min-w-0 lg:col-span-6">
            <ProjectsArt />
          </Reveal>
        </div>

        {/* ---------------- Filter bar ---------------- */}
        <div id="work-grid" className="scroll-mt-28">
          <Reveal>
            <div className="panel mt-10 flex flex-wrap items-center justify-between gap-3 p-2 md:mt-12">
              <div
                role="tablist"
                aria-label="Filter projects"
                className="no-scrollbar flex gap-1 overflow-x-auto"
              >
                {CATEGORIES.map((c) => {
                  const Icon = FILTER_ICONS[c] ?? LayoutGrid
                  const on = c === filter
                  return (
                    <button
                      key={c}
                      role="tab"
                      type="button"
                      aria-selected={on}
                      onClick={() => choose(c)}
                      className={`relative inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] transition-colors duration-300 ${
                        on ? 'text-white' : 'text-paper-400 hover:text-paper-50'
                      }`}
                    >
                      {on && (
                        <motion.span
                          layoutId="work-tab"
                          className="btn-grad absolute inset-0 -z-10 rounded-xl"
                          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                        />
                      )}
                      <Icon size={14} strokeWidth={1.9} />
                      {c === 'All' ? 'All Projects' : c}
                    </button>
                  )
                })}
              </div>

              <div className="flex items-center gap-2">
                {/* Sort */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setSortOpen((o) => !o)}
                    aria-expanded={sortOpen}
                    aria-haspopup="listbox"
                    className="inline-flex items-center gap-2.5 rounded-xl border border-[var(--edge)] px-4 py-2.5 text-[13px] text-paper-200 transition-colors hover:border-iris-400/60"
                  >
                    {sort}
                    <ChevronDown size={13} strokeWidth={2} className={`text-iris-300 transition-transform duration-300 ${sortOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {sortOpen && (
                      <motion.ul
                        role="listbox"
                        initial={reduced ? false : { opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={reduced ? undefined : { opacity: 0, y: -6 }}
                        transition={{ duration: 0.18 }}
                        className="absolute right-0 z-20 mt-2 w-48 overflow-hidden rounded-xl border border-[var(--edge-strong)] bg-ink-850/97 backdrop-blur-xl"
                      >
                        {SORTS.map((s) => (
                          <li key={s} role="option" aria-selected={s === sort}>
                            <button
                              type="button"
                              onClick={() => {
                                setSort(s)
                                setSortOpen(false)
                                setPage(1)
                              }}
                              className={`block w-full px-4 py-2.5 text-left text-[13px] transition-colors ${
                                s === sort ? 'bg-iris-500/18 text-paper-50' : 'text-paper-400 hover:bg-iris-500/10 hover:text-paper-50'
                              }`}
                            >
                              {s}
                            </button>
                          </li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </div>

                {/* View toggle */}
                <div className="flex items-center gap-1 rounded-xl border border-[var(--edge)] p-1">
                  {([['grid', LayoutGrid], ['list', Rows3]] as const).map(([v, Icon]) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setView(v)}
                      aria-label={`${v} view`}
                      aria-pressed={view === v}
                      className={`grid h-8 w-8 place-items-center rounded-lg transition-colors ${
                        view === v ? 'bg-iris-500/22 text-paper-50' : 'text-paper-600 hover:text-paper-200'
                      }`}
                    >
                      <Icon size={14} strokeWidth={1.9} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>

          {/* ---------------- Grid ---------------- */}
          <div
            className={`mt-6 grid gap-5 ${
              view === 'grid' ? 'sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
            }`}
          >
            <AnimatePresence mode="popLayout">
              {shown.map((p, i) => (
                <motion.div
                  key={p.slug}
                  layout={!reduced}
                  initial={reduced ? false : { opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduced ? undefined : { opacity: 0, y: -10 }}
                  transition={{ duration: 0.34, delay: reduced ? 0 : i * 0.04 }}
                >
                  <ProjectCard project={p} list={view === 'list'} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* ---------------- Pagination ---------------- */}
          {pages > 1 && (
            <nav aria-label="Project pages" className="mt-10 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setPage((n) => Math.max(1, n - 1))}
                disabled={current === 1}
                aria-label="Previous page"
                className="grid h-9 w-9 place-items-center rounded-lg border border-[var(--edge)] text-paper-400 transition-colors hover:border-iris-400 hover:text-paper-50 disabled:opacity-35 disabled:hover:border-[var(--edge)] disabled:hover:text-paper-400"
              >
                <ChevronLeft size={15} strokeWidth={2} />
              </button>
              {Array.from({ length: pages }, (_, k) => k + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setPage(n)}
                  aria-current={n === current ? 'page' : undefined}
                  className={`grid h-9 w-9 place-items-center rounded-lg text-[13px] transition-colors ${
                    n === current
                      ? 'border border-iris-500/50 bg-iris-500/16 text-paper-50'
                      : 'border border-[var(--edge)] text-paper-400 hover:border-iris-400 hover:text-paper-50'
                  }`}
                >
                  {n}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setPage((n) => Math.min(pages, n + 1))}
                disabled={current === pages}
                aria-label="Next page"
                className="grid h-9 w-9 place-items-center rounded-lg border border-[var(--edge)] text-paper-400 transition-colors hover:border-iris-400 hover:text-paper-50 disabled:opacity-35 disabled:hover:border-[var(--edge)] disabled:hover:text-paper-400"
              >
                <ChevronRight size={15} strokeWidth={2} />
              </button>
            </nav>
          )}
        </div>
      </div>
    </section>
  )
}
