import { motion, useInView } from 'motion/react'
import { useRef, type ComponentPropsWithoutRef, type ReactNode } from 'react'
import { useReducedMotion } from '../hooks'
import type { Shot } from '../data/projects'

/* ------------------------------------------------------------------ *
 * Scroll reveal
 * ------------------------------------------------------------------ */

export function Reveal({
  children,
  delay = 0,
  y = 20,
  className,
  as = 'div',
}: {
  children: ReactNode
  delay?: number
  y?: number
  className?: string
  as?: 'div' | 'li' | 'section' | 'article' | 'span'
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-10% 0px -6% 0px' })
  const reduced = useReducedMotion()
  const Tag = motion[as]
  return (
    <Tag
      ref={ref as never}
      className={className}
      initial={reduced ? false : { opacity: 0, y }}
      animate={inView || reduced ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.75, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </Tag>
  )
}

/* ------------------------------------------------------------------ *
 * Wordmark & section header
 * ------------------------------------------------------------------ */

export function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`display text-[15px] tracking-tight ${className}`}>
      <span className="text-paper-50">Gopi </span>
      <span className="text-grad">Patel</span>
    </span>
  )
}

export function SectionHeader({
  index,
  label,
  title,
  lede,
}: {
  index: string
  label: string
  title: ReactNode
  lede?: string
}) {
  return (
    <header className="mb-12 md:mb-16">
      <Reveal>
        <div className="flex items-center gap-3">
          <span aria-hidden className="h-px w-7 bg-linear-to-r from-azure-500 to-iris-400" />
          <span className="label">{label}</span>
          <span className="label text-paper-800">{index}</span>
        </div>
      </Reveal>
      <div className="mt-5 grid gap-x-12 gap-y-5 md:grid-cols-12">
        <Reveal delay={0.05} className="md:col-span-7">
          <h2 className="h-section text-paper-50">{title}</h2>
        </Reveal>
        {lede && (
          <Reveal delay={0.1} className="md:col-span-5 md:pt-2">
            <p className="max-w-[46ch] text-[14.5px] leading-relaxed text-paper-400">{lede}</p>
          </Reveal>
        )}
      </div>
    </header>
  )
}

/* ------------------------------------------------------------------ *
 * Buttons
 * ------------------------------------------------------------------ */

type BtnProps = Omit<
  ComponentPropsWithoutRef<'a'>,
  'onAnimationStart' | 'onDragStart' | 'onDragEnd' | 'onDrag' | 'style' | 'ref'
> & { variant?: 'grad' | 'ghost'; children: ReactNode }

export function ActionLink({ variant = 'ghost', children, className = '', ...rest }: BtnProps) {
  const skin =
    variant === 'grad'
      ? 'btn-grad text-white'
      : 'border border-[var(--edge-strong)] text-paper-200 hover:border-iris-400 hover:bg-iris-500/12 hover:text-paper-50'
  return (
    <a
      className={`group inline-flex items-center gap-2.5 rounded-full px-6 py-3 text-sm font-medium transition-all duration-300 hover:-translate-y-0.5 ${skin} ${className}`}
      {...rest}
    >
      {children}
    </a>
  )
}

export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-md border border-[var(--edge)] bg-iris-500/8 px-2.5 py-1 font-mono text-[11px] text-paper-200">
      {children}
    </span>
  )
}

export function Tags({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-wrap gap-1.5">
      {items.map((t) => (
        <li key={t}>
          <Tag>{t}</Tag>
        </li>
      ))}
    </ul>
  )
}

/* ------------------------------------------------------------------ *
 * Screenshot frames — screenshots are the evidence, so they get chrome
 * ------------------------------------------------------------------ */

export function Screenshot({
  shot,
  priority = false,
  className = '',
}: {
  shot: Shot
  priority?: boolean
  className?: string
}) {
  const img = (
    <img
      src={shot.src}
      alt={shot.alt}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      className="block w-full"
    />
  )

  if (shot.frame === 'phone') {
    return (
      // A portrait screenshot would otherwise fill the column and run to
      // thousands of pixels tall, so the handset is held to a phone's width
      // and centred in whatever space it is given.
      <figure className={`mx-auto w-full max-w-[320px] overflow-hidden rounded-[1.6rem] border border-[var(--edge-strong)] bg-ink-900 p-1.5 shadow-[0_30px_80px_-40px_rgba(0,0,0,1)] ${className}`}>
        <div className="overflow-hidden rounded-[1.25rem]">{img}</div>
      </figure>
    )
  }

  if (shot.frame === 'plain') {
    return (
      <figure className={`overflow-hidden rounded-xl border border-[var(--edge)] shadow-[0_30px_80px_-40px_rgba(0,0,0,1)] ${className}`}>
        {img}
      </figure>
    )
  }

  return (
    <figure className={`overflow-hidden rounded-xl border border-[var(--edge)] bg-ink-900 shadow-[0_30px_80px_-40px_rgba(0,0,0,1)] ${className}`}>
      <div className="flex items-center gap-1.5 border-b border-[var(--edge)] bg-ink-850 px-3.5 py-2.5">
        <span className="h-2 w-2 rounded-full bg-white/12" />
        <span className="h-2 w-2 rounded-full bg-white/12" />
        <span className="h-2 w-2 rounded-full bg-white/12" />
      </div>
      {img}
    </figure>
  )
}

/** A screenshot with its caption, used through the case studies. */
export function CaptionedShot({ shot, priority = false }: { shot: Shot; priority?: boolean }) {
  return (
    <div data-cursor="view">
      <Screenshot shot={shot} priority={priority} />
      {shot.caption && (
        // A phone frame is centred and narrow, so its caption follows it
        // rather than stretching across the empty column beside it.
        <p
          className={`mt-3 text-[12.5px] leading-relaxed text-paper-600 ${
            shot.frame === 'phone' ? 'mx-auto max-w-[320px]' : 'max-w-[62ch]'
          }`}
        >
          {shot.caption}
        </p>
      )}
    </div>
  )
}
