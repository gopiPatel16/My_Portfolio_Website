import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { GithubIcon, LinkedinIcon } from '../BrandIcons'
import { profile } from '../../data/profile'
import { projects } from '../../data/projects'
import { education } from '../../data/skills'

const [mca, bca] = education
import { FlowField } from '../FlowField'
import { useFinePointer, useReducedMotion } from '../../hooks'

/**
 * The title card: one full viewport of portrait, oversized type and technical
 * marginalia. The name sits in two weights — solid, then outlined — straddling
 * the figure, so the type and the subject occupy the same space.
 */
export function CinematicHero() {
  const reduced = useReducedMotion()
  const fine = useFinePointer()
  const ref = useRef<HTMLElement>(null)
  const [pointer, setPointer] = useState({ x: 0, y: 0 })
  const [scrolled, setScrolled] = useState(0)

  /* Pointer parallax — eased, and only where a mouse actually exists. */
  useEffect(() => {
    if (reduced || !fine) return
    let raf = 0
    const target = { x: 0, y: 0 }
    const current = { x: 0, y: 0 }
    const onMove = (e: PointerEvent) => {
      target.x = e.clientX / window.innerWidth - 0.5
      target.y = e.clientY / window.innerHeight - 0.5
    }
    const tick = () => {
      current.x += (target.x - current.x) * 0.06
      current.y += (target.y - current.y) * 0.06
      setPointer({ x: current.x, y: current.y })
      raf = requestAnimationFrame(tick)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    raf = requestAnimationFrame(tick)
    return () => {
      window.removeEventListener('pointermove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [reduced, fine])

  /* How far into this first screen we have scrolled, 0–1. */
  useEffect(() => {
    const onScroll = () => {
      const h = ref.current?.offsetHeight || window.innerHeight
      setScrolled(Math.min(1, Math.max(0, window.scrollY / h)))
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const p = reduced ? { x: 0, y: 0 } : pointer
  const s = reduced ? 0 : scrolled

  const meta = 'font-mono text-[10px] tracking-[0.22em] text-paper-400'
  const info = 'font-mono text-[11px] leading-snug tracking-[0.16em] md:text-[12px]'
  const social =
    'pointer-events-auto inline-flex items-center gap-2 rounded-full border border-[var(--edge-strong)] bg-ink-950/55 px-3.5 py-2 font-mono text-[10px] tracking-[0.18em] text-paper-200 backdrop-blur transition-colors duration-300 hover:border-iris-400 hover:bg-iris-500/15 hover:text-paper-50'

  return (
    <section
      ref={ref}
      id="home"
      className="relative flex min-h-svh flex-col justify-center overflow-hidden"
    >
      {/* ---------- Ground ---------- */}
      <div aria-hidden className="absolute inset-0 -z-30 bg-ink-950">
        <FlowField className="absolute inset-0 h-full w-full" strands={30} opacity={0.55} />
      </div>

      {/* ---------- Key light behind the figure ---------- */}
      <div
        aria-hidden
        className="absolute inset-0 -z-20"
        style={{
          background:
            'radial-gradient(46% 52% at 50% 44%, rgba(107,143,255,0.30), rgba(139,92,246,0.16) 45%, transparent 72%)',
          transform: `translate3d(${p.x * -18}px, ${p.y * -12}px, 0)`,
        }}
      />

      {/* ---------- The figure ---------- */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-[20vh] -z-10 flex justify-center md:top-[14vh]"
        style={{
          transform: `translate3d(${p.x * 22}px, ${p.y * 14 - s * 60}px, 0)`,
          opacity: 1 - s * 0.55,
          // The cut-out stops where the photograph did; fade it out so it
          // dissolves into the ground instead of ending on a straight edge.
          maskImage: 'linear-gradient(180deg, #000 62%, rgba(0,0,0,0.35) 88%, transparent 100%)',
          WebkitMaskImage:
            'linear-gradient(180deg, #000 62%, rgba(0,0,0,0.35) 88%, transparent 100%)',
        }}
      >
        <img
          src="/img/gopi-cutout.webp"
          srcSet="/img/gopi-cutout-sm.webp 700w, /img/gopi-cutout.webp 1200w"
          sizes="(max-width: 768px) 86vw, 53vh"
          alt=""
          fetchPriority="high"
          decoding="async"
          className="h-[48vh] w-auto max-w-none object-contain object-top md:h-[64vh]"
          style={{ filter: 'saturate(0.92) contrast(1.06) brightness(0.94)' }}
        />
      </div>

      {/* Grade the figure into the ground, top and bottom. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'linear-gradient(180deg, rgba(5,4,13,0.86) 0%, rgba(5,4,13,0.1) 26%, rgba(5,4,13,0.12) 58%, rgba(5,4,13,0.9) 92%, rgba(5,4,13,1) 100%)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 mix-blend-soft-light"
        style={{ background: 'linear-gradient(160deg, rgba(76,111,255,0.4), rgba(168,85,247,0.34))' }}
      />

      {/* ---------- Marginalia ---------- */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 pt-24 md:pt-28">
        <div className="shell">
          {/* Education first: the two facts a recruiter looks for, in the
              first thing they read. Set larger and brighter than the other
              marginalia on purpose. */}
          <div className="flex items-start justify-between gap-6">
            <div className="max-w-[46%] space-y-1.5">
              <p className={`${info} text-paper-50`}>MCA · {mca.year}</p>
              <p className={`${info} text-paper-200`}>MANIPAL INSTITUTE OF TECHNOLOGY</p>
              <p className={`${info} text-paper-400`}>MIT MANIPAL, KARNATAKA</p>
            </div>

            <div className="max-w-[46%] space-y-1.5 text-right">
              <p className={`${info} text-paper-50`}>BCA · {bca.year}</p>
              <p className={`${info} text-paper-200`}>MAHARAJA AGRASEN COLLEGE</p>
              <p className={`${info} text-paper-400`}>RAIPUR, CHHATTISGARH</p>
            </div>
          </div>
        </div>
      </div>

      {/* ---------- Name ---------- */}
      <div className="absolute inset-x-0 top-[56%] z-10 w-full md:top-[53%]">
        <div className="shell">
          <h1 className="text-center">
            <span className="sr-only">
              {profile.name} — {profile.roleLine}
            </span>

            {/* One line, two weights: solid then outline. Wraps rather than
                overflowing if the viewport gets too narrow for both words. */}
            <span
              aria-hidden
              className="display flex flex-wrap items-baseline justify-center gap-x-[0.2em] gap-y-0 text-[clamp(1.9rem,9.4vw,8.6rem)] leading-[0.9]"
            >
              <span
                className="text-paper-50"
                style={{ transform: `translate3d(${p.x * -34}px, ${s * -40}px, 0)` }}
              >
                GOPI
              </span>
              <span
                className="text-transparent"
                style={{
                  WebkitTextStroke: '1.4px rgba(245,246,250,0.62)',
                  transform: `translate3d(${p.x * -52}px, ${s * -14}px, 0)`,
                }}
              >
                PATEL
              </span>
            </span>

          </h1>

          <p
            aria-hidden
            className="mx-auto mt-6 max-w-[30ch] text-center text-[clamp(0.9rem,3.4vw,1.4rem)] italic leading-snug text-paper-200 md:max-w-none"
            style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              transform: `translate3d(${p.x * -18}px, 0, 0)`,
              opacity: 0.96 - s * 0.96,
            }}
          >
            I design prompts, evaluate models, and build GenAI workflows.
          </p>
        </div>
      </div>

      {/* ---------- Work, research, and where to find me ---------- */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 pb-7">
        <div className="shell">
          {/* Three columns once there is room; on a phone the profile links
              take their own centred line above the two fact blocks, which
              already meet in the middle at that width. */}
          <div className="grid grid-cols-2 items-end gap-x-6 gap-y-5 md:grid-cols-[1fr_auto_1fr]">
            <div className="order-2 space-y-2 md:order-1">
              <p className={`${meta} whitespace-nowrap text-paper-200`}>{projects.length} PROJECTS BUILT</p>
              <p className={`${meta} whitespace-nowrap`}>{profile.clientProjects} CLIENT PROJECTS</p>
            </div>

            <div className="order-1 col-span-2 flex items-center justify-center gap-2.5 md:order-2 md:col-span-1">
              <a href={profile.linkedin} target="_blank" rel="noreferrer noopener" className={social}>
                <LinkedinIcon size={13} className="text-iris-300" />
                LINKEDIN
              </a>
              <a href={profile.github} target="_blank" rel="noreferrer noopener" className={social}>
                <GithubIcon size={13} className="text-iris-300" />
                GITHUB
              </a>
            </div>

            <div className="order-3 space-y-2 text-right">
              {/* "Accepted", not "published": the acceptance email and the
                  programme schedule are all the source material shows. */}
              <a
                href="#research"
                className={`${meta} pointer-events-auto inline-flex items-center gap-1 text-right text-paper-200 transition-colors hover:text-paper-50`}
              >
                {/* Breaks at the dot on phones instead of mid-name. */}
                <span>
                  RESEARCH PAPER
                  <span className="hidden sm:inline"> · </span>
                  <br className="sm:hidden" />
                  IEEE ICCCNT 2025
                </span>
                <ArrowUpRight size={11} strokeWidth={2.2} className="shrink-0" />
              </a>
              <p className={meta}>ACCEPTED · PAPER 8711</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
