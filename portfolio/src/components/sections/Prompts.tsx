import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowRight, Check, ChevronLeft, ChevronRight, Copy, Cpu, Play, Terminal } from 'lucide-react'
import { promptCases, promptStats, type PromptCase } from '../../data/prompts'
import { Reveal, SectionHeader } from '../primitives'
import { useReducedMotion } from '../../hooks'

/* ------------------------------------------------------------------ *
 * Output
 * ------------------------------------------------------------------ */

/**
 * Fills the output box, which is cut to the media's own proportions, so the
 * picture meets every edge. `object-contain` only guards sub-pixel rounding.
 *
 * Video plays only once on screen, and never autoplays under reduced motion.
 */
function OutputMedia({ item }: { item: PromptCase }) {
  const { media } = item
  const ref = useRef<HTMLVideoElement>(null)
  const reduced = useReducedMotion()
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || reduced) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.play().then(() => setPlaying(true)).catch(() => setPlaying(false))
        } else {
          el.pause()
        }
      },
      { threshold: 0.3 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [reduced, media])

  if (media.kind === 'image') {
    return (
      <img
        src={media.src}
        alt={media.alt}
        width={media.width}
        height={media.height}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-contain"
      />
    )
  }

  return (
    <>
      <video
        ref={ref}
        src={media.src}
        poster={media.poster}
        width={media.width}
        height={media.height}
        muted
        loop
        playsInline
        preload="none"
        aria-label={media.alt}
        controls={reduced}
        className="absolute inset-0 h-full w-full object-contain"
      />
      {!playing && !reduced && (
        <span aria-hidden className="pointer-events-none absolute inset-0 grid place-items-center">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-ink-950/70 text-paper-50 backdrop-blur">
            <Play size={16} strokeWidth={2} className="translate-x-px" />
          </span>
        </span>
      )}
    </>
  )
}

/* ------------------------------------------------------------------ *
 * Copy
 * ------------------------------------------------------------------ */

/**
 * Copies the full prompt, not just what is scrolled into view. Uses the async
 * clipboard where the page is a secure context and falls back to a hidden
 * textarea elsewhere, and says plainly when neither worked.
 */
function CopyPrompt({ text }: { text: string }) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle')

  useEffect(() => {
    if (state === 'idle') return
    const t = window.setTimeout(() => setState('idle'), 1800)
    return () => window.clearTimeout(t)
  }, [state])

  const copy = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text)
      } else {
        const area = document.createElement('textarea')
        area.value = text
        area.setAttribute('readonly', '')
        area.style.position = 'fixed'
        area.style.opacity = '0'
        document.body.appendChild(area)
        area.select()
        const ok = document.execCommand('copy')
        area.remove()
        if (!ok) throw new Error('copy command refused')
      }
      setState('copied')
    } catch {
      setState('failed')
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={copy}
        className="inline-flex items-center gap-1.5 rounded-full border border-[var(--edge-strong)] px-2.5 py-1 font-mono text-[10px] tracking-[0.12em] text-paper-200 transition-colors hover:border-iris-400 hover:bg-iris-500/12 hover:text-paper-50"
      >
        {state === 'copied' ? (
          <Check size={11} strokeWidth={2.2} className="text-iris-300" />
        ) : (
          <Copy size={11} strokeWidth={2} />
        )}
        {state === 'copied' ? 'COPIED' : state === 'failed' ? 'COPY FAILED' : 'COPY'}
      </button>
      <span role="status" className="sr-only">
        {state === 'copied' ? 'Prompt copied to clipboard' : state === 'failed' ? 'Could not copy the prompt' : ''}
      </span>
    </>
  )
}

/* ------------------------------------------------------------------ *
 * Selector — scrollable, with real affordances at both ends
 * ------------------------------------------------------------------ */

function Selector({
  index,
  onPick,
}: {
  index: number
  onPick: (i: number) => void
}) {
  const strip = useRef<HTMLDivElement>(null)
  const [edges, setEdges] = useState({ left: false, right: true })

  const measure = useCallback(() => {
    const el = strip.current
    if (!el) return
    setEdges({
      left: el.scrollLeft > 4,
      right: el.scrollLeft + el.clientWidth < el.scrollWidth - 4,
    })
  }, [])

  useEffect(() => {
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [measure])

  // Keep the active chip in view when it changes from outside the strip.
  //
  // Scrolls the strip, never the page. `scrollIntoView` walks every scrollable
  // ancestor, window included, so on first render it dragged the whole site
  // down to this section about a second after load. It also skips the mount:
  // chip 01 is already in view, and there is nothing to bring into it.
  const mounted = useRef(false)
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true
      return
    }
    const box = strip.current
    const el = box?.querySelector<HTMLElement>(`[data-chip="${index}"]`)
    if (!box || !el) return
    const left = el.offsetLeft - box.offsetLeft
    const right = left + el.offsetWidth
    if (left < box.scrollLeft) box.scrollTo({ left: left - 16, behavior: 'smooth' })
    else if (right > box.scrollLeft + box.clientWidth)
      box.scrollTo({ left: right - box.clientWidth + 16, behavior: 'smooth' })
  }, [index])

  const nudge = (dir: -1 | 1) =>
    strip.current?.scrollBy({ left: dir * strip.current.clientWidth * 0.75, behavior: 'smooth' })

  const arrow =
    'grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[var(--edge-strong)] text-paper-400 transition-colors hover:border-iris-400 hover:bg-iris-500/12 hover:text-paper-50 disabled:opacity-30 disabled:hover:border-[var(--edge-strong)] disabled:hover:bg-transparent disabled:hover:text-paper-400'

  return (
    <div className="flex items-center gap-3">
      <button type="button" onClick={() => nudge(-1)} disabled={!edges.left} aria-label="Previous examples" className={arrow}>
        <ChevronLeft size={15} strokeWidth={2} />
      </button>

      <div className="relative min-w-0 flex-1">
        <div
          ref={strip}
          onScroll={measure}
          role="tablist"
          aria-label="Prompt examples"
          className="no-scrollbar flex gap-2 overflow-x-auto scroll-smooth py-1"
        >
          {promptCases.map((c, i) => {
            const on = i === index
            return (
              <button
                key={c.id}
                data-chip={i}
                role="tab"
                type="button"
                aria-selected={on}
                onClick={() => onPick(i)}
                className={`shrink-0 rounded-full border px-4 py-2 text-[12.5px] transition-colors duration-300 ${
                  on
                    ? 'border-iris-500/50 bg-iris-500/14 text-paper-50'
                    : 'border-[var(--edge)] text-paper-400 hover:border-[var(--edge-strong)] hover:text-paper-200'
                }`}
              >
                <span className="font-mono text-[10px] text-iris-300">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="ml-2">{c.title}</span>
              </button>
            )
          })}
        </div>

        {/* Fades signal that the strip continues. */}
        {edges.left && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 w-12"
            style={{ background: 'linear-gradient(90deg, var(--color-ink-950), transparent)' }}
          />
        )}
        {edges.right && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 w-12"
            style={{ background: 'linear-gradient(270deg, var(--color-ink-950), transparent)' }}
          />
        )}
      </div>

      <button type="button" onClick={() => nudge(1)} disabled={!edges.right} aria-label="More examples" className={arrow}>
        <ChevronRight size={15} strokeWidth={2} />
      </button>
    </div>
  )
}

/* ------------------------------------------------------------------ */

/** Counted, so the lede cannot fall out of step with the cases again. */
const shippedCount = promptCases.filter((c) => c.shippedTo).length

/**
 * The output box takes the exact shape of its media, so every output fills it.
 * Its width comes from the column: a landscape output gets the wide column and
 * grows taller with it, a portrait output gets a narrow column so its tall box
 * stays a sensible size. The model card column is kept narrow to give both
 * boxes more room.
 *
 * The prompt box takes the row's height beside it: `h-0 min-h-full` keeps a long
 * prompt from stretching the row, and the text scrolls inside instead. Stacked
 * on a phone there is no row to match, so it gets a fixed height there.
 */
const PROMPT_BOX = 'h-[28rem] lg:h-0 lg:min-h-full'
const SIDE_ARROW =
  'absolute top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-[var(--edge-strong)] bg-ink-950/80 text-paper-200 backdrop-blur transition-colors hover:border-iris-400 hover:bg-iris-500/15 hover:text-paper-50 lg:grid'
const ROW_ARROW =
  'inline-flex items-center gap-1.5 rounded-full border border-[var(--edge-strong)] px-4 py-2 text-[13px] text-paper-200 transition-colors hover:border-iris-400 hover:bg-iris-500/12 hover:text-paper-50'
const COLUMNS = {
  landscape: 'lg:grid-cols-[minmax(0,5fr)_9rem_minmax(0,6fr)]',
  portrait: 'lg:grid-cols-[minmax(0,1fr)_9rem_minmax(0,19rem)]',
}

export function Prompts() {
  const [index, setIndex] = useState(0)
  const reduced = useReducedMotion()
  const item = promptCases[index]
  const portrait = item.media.height > item.media.width
  const total = promptCases.length
  /** Wraps round at both ends, so the arrows never dead-end. */
  const go = (step: -1 | 1) => setIndex((i) => (i + step + total) % total)

  return (
    <section id="prompts" className="relative scroll-mt-24 py-20 md:py-28">
      <div className="shell">
        <SectionHeader
          index="02"
          label="Prompt practice"
          title={
            <>
              I don’t ask AI questions. <span className="text-grad">I brief it.</span>
            </>
          }
          lede={`Each prompt sits beside the real output it describes, written in the structure of the model that made it. ${shippedCount} were shipped into projects.`}
        />

        <Reveal>
          <dl className="mb-10 flex flex-wrap gap-x-12 gap-y-5">
            {promptStats.map((s) => (
              <div key={s.label}>
                <dd className="display text-[1.7rem] text-paper-50">{s.value}</dd>
                <dt className="label mt-1">{s.label}</dt>
              </div>
            ))}
          </dl>
        </Reveal>

        <Reveal delay={0.05}>
          <Selector index={index} onPick={setIndex} />
        </Reveal>

        {/* Previous / next. Beside the case from 1024px up, sitting in the page
            gutter; in a row underneath on narrower screens, where the gutter is
            too thin to hold them. */}
        <div className="relative mt-8">
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous prompt"
            className={`${SIDE_ARROW} -left-12`}
          >
            <ChevronLeft size={18} strokeWidth={2} />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next prompt"
            className={`${SIDE_ARROW} -right-12`}
          >
            <ChevronRight size={18} strokeWidth={2} />
          </button>

        <Reveal delay={0.08}>
          <AnimatePresence mode="wait">
            <motion.div
              key={item.id}
              initial={reduced ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className={`grid gap-4 ${portrait ? COLUMNS.portrait : COLUMNS.landscape}`}
            >
              {/* Prompt */}
              <div className={`panel flex min-w-0 flex-col overflow-hidden ${PROMPT_BOX}`}>
                <div className="flex h-11 shrink-0 items-center gap-2 border-b border-[var(--edge)] px-4">
                  <Terminal size={12} strokeWidth={1.8} className="text-azure-400" />
                  <span className="font-mono text-[10px] tracking-[0.18em] text-paper-600">PROMPT</span>
                  <span className="ml-auto font-mono text-[10px] tracking-[0.14em] text-paper-800">
                    {String(index + 1).padStart(2, '0')} / {String(promptCases.length).padStart(2, '0')}
                  </span>
                  <CopyPrompt text={item.prompt} />
                </div>
                {/* Structured prompts carry their own line breaks and
                    indentation, so the text keeps its whitespace and scrolls
                    inside the box. data-lenis-prevent hands the wheel back to
                    this box; without it Lenis scrolls the page instead. It is
                    focusable so a keyboard can scroll it too. */}
                <blockquote
                  tabIndex={0}
                  aria-label="Prompt text"
                  data-lenis-prevent
                  className="min-h-0 flex-1 overflow-y-auto whitespace-pre-wrap break-words px-4 py-4 font-mono text-[11.5px] leading-[1.75] text-paper-200 outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-iris-400"
                >
                  {item.prompt}
                </blockquote>
                <p className="border-t border-[var(--edge)] px-4 py-3 text-[12px] leading-relaxed text-paper-600">
                  <span className="text-paper-400">Intent — </span>
                  {item.intent}
                </p>
              </div>

              {/* Model */}
              <div className="flex min-w-0 items-center justify-center">
                <div className="panel w-full p-4 text-center">
                  <Cpu size={16} strokeWidth={1.7} className="mx-auto text-iris-300" />
                  <p className="mt-3 text-[12.5px] leading-snug text-paper-50">{item.model}</p>
                  <p className="mt-2 font-mono text-[9.5px] leading-relaxed tracking-[0.12em] text-paper-600">
                    {item.technique.toUpperCase()}
                  </p>
                  <ArrowRight
                    aria-hidden
                    size={15}
                    strokeWidth={2}
                    className="mx-auto mt-3 rotate-90 text-paper-800 lg:rotate-0"
                  />
                </div>
              </div>

              {/* Output */}
              <div
                className={`panel flex min-w-0 flex-col self-start overflow-hidden ${
                  portrait ? 'mx-auto w-full max-w-xs lg:max-w-none' : ''
                }`}
              >
                <div className="flex h-11 shrink-0 items-center gap-2 border-b border-[var(--edge)] px-4">
                  <span className="font-mono text-[10px] tracking-[0.18em] text-paper-600">OUTPUT</span>
                  {item.shippedTo && (
                    <span className="ml-auto rounded-full bg-azure-500/15 px-2.5 py-0.5 font-mono text-[9.5px] tracking-[0.12em] text-azure-400">
                      SHIPPED → {item.shippedTo.toUpperCase()}
                    </span>
                  )}
                </div>
                <div
                  className="relative w-full bg-ink-950/60"
                  style={{ aspectRatio: `${item.media.width} / ${item.media.height}` }}
                >
                  <OutputMedia item={item} />
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </Reveal>
        </div>

        <div className="mt-5 flex items-center justify-between lg:hidden">
          <button type="button" onClick={() => go(-1)} aria-label="Previous prompt" className={ROW_ARROW}>
            <ChevronLeft size={16} strokeWidth={2} />
            Previous
          </button>
          <span className="font-mono text-[11px] tracking-[0.14em] text-paper-400">
            {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
          </span>
          <button type="button" onClick={() => go(1)} aria-label="Next prompt" className={ROW_ARROW}>
            Next
            <ChevronRight size={16} strokeWidth={2} />
          </button>
        </div>

      </div>
    </section>
  )
}
