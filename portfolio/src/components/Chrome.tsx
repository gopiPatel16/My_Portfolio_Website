import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { ArrowUp, FileText, Menu, X } from 'lucide-react'
import { navItems, profile } from '../data/profile'
import { Wordmark } from './primitives'
import { usePdfPreview } from './pdf-preview-context'
import {
  useActiveSection,
  useFinePointer,
  useReducedMotion,
  useScrollProgress,
  useScrolledPast,
  scrollToTop,
} from '../hooks'

const NAV_IDS = navItems.map((n) => n.id)

/* ------------------------------------------------------------------ *
 * Ambient depth — blooms and a faint grid behind everything
 * ------------------------------------------------------------------ */

export function Backdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-20 overflow-hidden grain">
      <div
        className="absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(139,92,246,0.05) 1px, transparent 1px),' +
            'linear-gradient(to bottom, rgba(139,92,246,0.05) 1px, transparent 1px)',
          backgroundSize: '68px 68px',
          maskImage: 'radial-gradient(140% 95% at 50% 0%, #000 8%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(140% 95% at 50% 0%, #000 8%, transparent 70%)',
        }}
      />
      <div
        className="absolute -top-[26rem] left-1/2 h-[48rem] w-[72rem] -translate-x-1/2 rounded-full opacity-55 blur-[130px]"
        style={{
          background:
            'radial-gradient(closest-side, rgba(76,111,255,0.26), rgba(139,92,246,0.10) 55%, transparent)',
        }}
      />
      <div
        className="absolute bottom-[-18rem] right-[-14rem] h-[42rem] w-[42rem] rounded-full opacity-40 blur-[140px]"
        style={{ background: 'radial-gradient(closest-side, rgba(168,85,247,0.24), transparent 70%)' }}
      />
    </div>
  )
}

export function ScrollProgress() {
  const progress = useScrollProgress()
  return (
    <div aria-hidden className="fixed inset-x-0 top-0 z-60 h-px">
      <div
        className="h-full origin-left bg-linear-to-r from-azure-500 via-iris-400 to-iris-300"
        style={{ transform: `scaleX(${progress})` }}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ *
 * Navigation
 * ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ *
 * Back to top — appears once the reader is well into the page
 * ------------------------------------------------------------------ */

export function BackToTop() {
  const show = useScrolledPast(700)
  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Back to top"
      // `invisible` rather than only transparent, so the hidden button cannot
      // be tabbed to or clicked through.
      className={`fixed bottom-5 right-5 z-40 grid h-11 w-11 place-items-center rounded-full border border-[var(--edge-strong)] bg-ink-950/85 text-paper-200 shadow-[0_8px_30px_rgba(0,0,0,0.45)] backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-iris-400 hover:bg-iris-500/20 hover:text-paper-50 md:bottom-7 md:right-7 ${
        show ? 'visible translate-y-0 opacity-100' : 'invisible translate-y-3 opacity-0'
      }`}
    >
      <ArrowUp size={17} strokeWidth={2} />
    </button>
  )
}

export function Nav() {
  const preview = usePdfPreview()
  const { pathname } = useLocation()
  const onHome = pathname === '/'
  const active = useActiveSection(onHome ? NAV_IDS : [])
  const compact = useScrolledPast(40)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const href = (id: string) => (onHome ? `#${id}` : `/#${id}`)

  return (
    <>
      <a
        href={onHome ? '#work' : '/'}
        className="sr-only rounded-full bg-paper-50 px-4 py-2 text-sm text-ink-950 focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-100"
      >
        Skip to content
      </a>

      <header className="fixed inset-x-0 top-0 z-50 pt-3 md:pt-5">
        <div className="shell">
          <nav
            aria-label="Primary"
            // Without the wordmark there is nothing on the left, so below the
            // breakpoint the bar hugs its controls instead of stretching an
            // empty pill across the whole screen. 1024px rather than a stock
            // breakpoint because that is where the centred links stop running
            // into the actions pinned to the right.
            className={`relative ml-auto flex w-fit items-center justify-end gap-4 rounded-2xl px-4 py-3 transition-all duration-500 md:px-5 min-[1024px]:ml-0 min-[1024px]:w-full min-[1024px]:justify-center ${
              compact
                ? 'border border-[var(--edge)] bg-ink-950/80 backdrop-blur-xl'
                : 'border border-transparent'
            }`}
          >
            {/* No wordmark: the hero already states the name at full size, and
                a second one competes with it. Links carry the wayfinding. */}
            <ul className="hidden items-center gap-0.5 min-[1024px]:flex">
              {navItems.map((item) => {
                const isActive = onHome && active === item.id
                return (
                  <li key={item.id}>
                    <a
                      href={href(item.id)}
                      aria-current={isActive ? 'true' : undefined}
                      className={`relative block rounded-full px-3.5 py-1.5 text-[13.5px] transition-colors duration-300 ${
                        isActive ? 'text-paper-50' : 'text-paper-400 hover:text-paper-50'
                      }`}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="nav-pill"
                          className="absolute inset-0 -z-10 rounded-full border border-iris-500/40 bg-iris-500/12"
                          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                        />
                      )}
                      {item.label}
                    </a>
                  </li>
                )
              })}
            </ul>

            <div className="flex items-center gap-2 min-[1024px]:absolute min-[1024px]:right-5">
              {/* The resume, one click from anywhere on the site. Opens the
                  on-site reader, which carries its own Download button. */}
              <a
                href={profile.resume.src}
                target="_blank"
                rel="noreferrer noopener"
                onClick={preview(profile.resume)}
                className="inline-flex items-center gap-1.5 rounded-full border border-iris-400/60 bg-iris-500/15 px-4 py-1.5 text-[13px] text-paper-50 transition-colors duration-300 hover:border-iris-400 hover:bg-iris-500/25"
              >
                <FileText size={13} strokeWidth={2} />
                View resume
              </a>
              <button
                type="button"
                onClick={() => setOpen(true)}
                aria-label="Open menu"
                className="grid h-9 w-9 place-items-center rounded-full border border-[var(--edge-strong)] text-paper-200 transition-colors hover:text-paper-50 min-[1024px]:hidden"
              >
                <Menu size={16} strokeWidth={1.8} />
              </button>
            </div>
          </nav>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-70 bg-ink-950/97 backdrop-blur-xl min-[1024px]:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.26 }}
          >
            <div className="shell flex h-full flex-col pt-6 pb-10">
              <div className="flex items-center justify-between">
                <Wordmark />
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  className="grid h-10 w-10 place-items-center rounded-full border border-[var(--edge-strong)] text-paper-200"
                >
                  <X size={17} strokeWidth={1.8} />
                </button>
              </div>

              <ul className="mt-8 flex flex-1 flex-col justify-center gap-0.5">
                {navItems.map((item, i) => (
                  <motion.li
                    key={item.id}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 + i * 0.04, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <a
                      href={href(item.id)}
                      onClick={() => setOpen(false)}
                      className="display flex items-baseline gap-4 border-b border-[var(--edge)] py-3.5 text-[1.7rem] text-paper-50"
                    >
                      <span className="font-mono text-[11px] font-normal text-iris-400">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      {item.label}
                    </a>
                  </motion.li>
                ))}
              </ul>

              <div className="flex flex-wrap gap-x-6 gap-y-2 pt-6 font-mono text-[11px] tracking-wide text-paper-600">
                <a href={profile.linkedin} target="_blank" rel="noreferrer noopener">LINKEDIN</a>
                <a href={profile.github} target="_blank" rel="noreferrer noopener">GITHUB</a>
                <a href={`mailto:${profile.email}`}>EMAIL</a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

/* ------------------------------------------------------------------ *
 * Cursor — desktop, fine pointer, motion allowed
 * ------------------------------------------------------------------ */

export function Cursor() {
  const fine = useFinePointer()
  const reduced = useReducedMotion()
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)
  const [mode, setMode] = useState<'idle' | 'link' | 'view'>('idle')

  useEffect(() => {
    if (!fine || reduced) return
    const onMove = (e: PointerEvent) => {
      setPos({ x: e.clientX, y: e.clientY })
      const el = (e.target as HTMLElement)?.closest?.('[data-cursor],a,button')
      if (!el) return setMode('idle')
      setMode(el.getAttribute('data-cursor') === 'view' ? 'view' : 'link')
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [fine, reduced])

  if (!fine || reduced || !pos) return null
  const size = mode === 'view' ? 68 : mode === 'link' ? 30 : 9

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-90"
      style={{ transform: `translate3d(${pos.x}px, ${pos.y}px, 0)` }}
    >
      <div
        className="grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full font-mono text-[9px] font-medium tracking-[0.18em] text-white transition-[width,height] duration-300 ease-[var(--ease-out-quint)]"
        style={{
          width: size,
          height: size,
          background:
            mode === 'idle'
              ? 'rgba(201,163,255,0.9)'
              : 'linear-gradient(100deg, rgba(76,111,255,0.9), rgba(168,85,247,0.9))',
          boxShadow: '0 0 26px -6px rgba(168,85,247,0.95)',
        }}
      >
        {mode === 'view' && 'VIEW'}
      </div>
    </div>
  )
}
