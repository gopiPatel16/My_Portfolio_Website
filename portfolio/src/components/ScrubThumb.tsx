import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import type { Project } from '../data/projects'
import { useFinePointer, useReducedMotion } from '../hooks'

/**
 * A card thumbnail that scrubs through the project's real screenshots.
 *
 * On a fine pointer, moving across the card picks the frame directly — like
 * scrubbing a video — and hovering without moving auto-advances. On touch it
 * auto-advances once the card is on screen. Under reduced motion it holds the
 * first frame and the rail simply marks how many screenshots exist.
 *
 * Frames after the first are only put into the DOM once the card is engaged, so
 * a page of cards does not fetch forty images up front.
 */
export function ScrubThumb({
  project,
  className = '',
  children,
}: {
  project: Project
  className?: string
  /**
   * Overlays that belong inside the thumbnail — badges, the open button.
   * They are rendered as children so that moving onto them does not count as
   * leaving the scrubber, which would reset the frame.
   */
  children?: ReactNode
}) {
  const shots = project.images.filter((s) => !s.hideFromCard)
  const many = shots.length > 1
  const box = useRef<HTMLDivElement>(null)
  const [i, setI] = useState(0)
  const [engaged, setEngaged] = useState(false)
  /** Timestamp of the last deliberate scrub, so auto-advance yields to it. */
  const lastManual = useRef(0)
  const fine = useFinePointer()
  const reduced = useReducedMotion()

  /* Touch and coarse pointers: advance while the card is on screen. */
  useEffect(() => {
    if (!many || reduced || fine) return
    const el = box.current
    if (!el) return
    let timer = 0
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setEngaged(true)
          timer = window.setInterval(() => setI((n) => (n + 1) % shots.length), 2200)
        } else {
          window.clearInterval(timer)
        }
      },
      { threshold: 0.5 },
    )
    io.observe(el)
    return () => {
      window.clearInterval(timer)
      io.disconnect()
    }
  }, [many, reduced, fine, shots.length])

  /* Fine pointer: auto-advance while hovered, so a still cursor still reveals. */
  useEffect(() => {
    if (!many || reduced || !fine || !engaged) return
    const timer = window.setInterval(() => {
      // Never pull the frame out from under someone who is scrubbing.
      if (Date.now() - lastManual.current < 1800) return
      setI((n) => (n + 1) % shots.length)
    }, 1500)
    return () => window.clearInterval(timer)
  }, [many, reduced, fine, engaged, shots.length])

  /* Moving across the card selects a frame directly. */
  const onMove = useCallback(
    (e: React.PointerEvent) => {
      setEngaged(true)
      if (!many || reduced || !fine) return
      const r = e.currentTarget.getBoundingClientRect()
      const t = Math.min(0.999, Math.max(0, (e.clientX - r.left) / r.width))
      lastManual.current = Date.now()
      setI(Math.floor(t * shots.length))
    },
    [many, reduced, fine, shots.length],
  )

  if (shots.length === 0) {
    return (
      <div ref={box} className={className || 'relative'}>
        <Plate project={project} />
        {children}
      </div>
    )
  }

  // Only the first frame is eager; the rest arrive once the card is engaged.
  const loaded = engaged || reduced ? shots.length : 1
  // The index can briefly outrun what is mounted; clamping keeps a frame on
  // screen instead of fading everything out.
  const shown = Math.min(i, loaded - 1)

  return (
    <div
      ref={box}
      className={className || 'relative'}
      onPointerEnter={() => setEngaged(true)}
      onPointerLeave={() => {
        setEngaged(false)
        setI(0)
      }}
      onPointerMove={onMove}
      onFocusCapture={() => setEngaged(true)}
      onBlurCapture={() => setEngaged(false)}
    >
      {children}
      {shots.slice(0, loaded).map((shot, k) => (
        <img
          key={shot.src}
          src={shot.src}
          alt={k === 0 ? project.coverAlt || shot.alt : ''}
          aria-hidden={k !== 0}
          loading={k === 0 ? 'lazy' : 'lazy'}
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover object-top transition-opacity duration-300"
          style={{ opacity: k === shown ? 1 : 0 }}
        />
      ))}

      {/* Segmented rail — also the affordance that more screenshots exist. */}
      {many && (
        <div
          aria-hidden
          className="absolute inset-x-3 bottom-3 z-10 flex gap-1 transition-opacity duration-300"
          style={{ opacity: engaged || !fine ? 1 : 0.45 }}
        >
          {shots.map((s, k) => (
            <span
              key={s.src}
              className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/15"
            >
              <span
                className="block h-full rounded-full bg-linear-to-r from-azure-400 to-iris-300 transition-transform duration-300 ease-[var(--ease-out-quint)]"
                style={{ transform: `scaleX(${k === shown ? 1 : 0})`, transformOrigin: 'left' }}
              />
            </span>
          ))}
        </div>
      )}

      {/* Frame counter, only while engaged. */}
      {many && (
        <span
          aria-hidden
          className="absolute bottom-7 right-3 z-10 rounded-md bg-ink-950/75 px-2 py-0.5 font-mono text-[9.5px] tracking-[0.12em] text-paper-200 backdrop-blur transition-opacity duration-300"
          style={{ opacity: engaged ? 1 : 0 }}
        >
          {String(shown + 1).padStart(2, '0')} / {String(shots.length).padStart(2, '0')}
        </span>
      )}
    </div>
  )
}

/** Fallback for a project with no screenshots. */
function Plate({ project }: { project: Project }) {
  return (
    <div
      className="h-full w-full"
      style={{
        background: 'radial-gradient(85% 95% at 25% 12%, rgba(76,111,255,0.30), rgba(8,7,20,1) 74%)',
      }}
    >
      <div
        aria-hidden
        className="absolute inset-0 opacity-45"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(201,163,255,0.10) 1px, transparent 1px),' +
            'linear-gradient(to bottom, rgba(201,163,255,0.10) 1px, transparent 1px)',
          backgroundSize: '26px 26px',
        }}
      />
      <span className="display absolute bottom-4 left-5 text-[1.5rem] leading-none text-paper-50/20">
        {project.name.split(' ').slice(0, 2).join(' ')}
      </span>
    </div>
  )
}
