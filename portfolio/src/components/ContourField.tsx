import { useEffect, useId, useMemo, useRef } from 'react'
import { useMinWidth, useReducedMotion } from '../hooks'

/**
 * A contour pattern: concentric arcs sweeping out of a focus that sits off the
 * corner of the frame, so only the outer sweep of each ring crosses the
 * section — the way ripple rings read when the stone landed off-camera.
 *
 * Rings are spaced geometrically — tight near the focus, opening out as they
 * travel — and faded by a radial mask so no line ever ends on a hard edge.
 *
 * Given `labels`, the rings also carry text: each name rides its own ring like
 * a word on a rolling belt, drifting along the curve and dissolving into the
 * same mask that fades the lines.
 */
export function ContourField({
  className = '',
  rings = 18,
  /** Where the rings radiate from, as a fraction of the box. */
  focus = { x: 1.04, y: 1.24 },
  /** Flattening of the rings; 1 is circular. */
  squash = 0.9,
  /** Degrees of tilt applied about the focus. */
  tilt = -10,
  /** How much of the pattern survives at the very top of the box. */
  headroom = 0.14,
  /** Names to send travelling along the rings. */
  labels = [],
  opacity = 0.5,
}: {
  className?: string
  rings?: number
  focus?: { x: number; y: number }
  squash?: number
  tilt?: number
  headroom?: number
  labels?: readonly string[]
  opacity?: number
}) {
  const uid = useId().replace(/:/g, '')
  const reduced = useReducedMotion()
  // Slicing a 1200-wide viewBox into a narrow column zooms it past 2x, so a
  // ten-character name would span the whole screen. The arcs still read at
  // that scale; the words do not, so below this the rings run bare.
  const wide = useMinWidth(768)
  const svg = useRef<SVGSVGElement>(null)
  const marks = useRef<(SVGTextPathElement | null)[]>([])

  const W = 1200
  const H = 620
  const cx = W * focus.x
  const cy = H * focus.y

  // Geometric spacing: each ring is a fixed ratio larger than the last, which
  // packs them near the focus and opens them out across the frame.
  const first = 190
  const ratio = 1.135
  const radii = useMemo(
    () => Array.from({ length: rings }, (_, i) => first * ratio ** i),
    [rings],
  )
  const far = radii[radii.length - 1]

  /**
   * Which ring each label rides, and where on it.
   *
   * Only part of every ring crosses the section — the sweep between its left
   * edge and its crown — so the travel is confined to that stretch. Run a label
   * around the whole ellipse instead and it spends most of the loop parked
   * somewhere off-canvas.
   */
  const riders = useMemo(() => {
    // One name per ring wherever there are enough rings to go round: two on
    // the same ellipse eventually overlap into an unreadable knot.
    if (!wide) return []
    const usable = radii.map((_, i) => i).filter((i) => i >= 3)
    return labels.map((text, i) => ({
      text,
      ring: usable[i % usable.length],
      // The stretch of each ring that crosses the section, left edge to crown.
      // Travelling past it walks the name off the side of the box mid-word.
      from: 0.515,
      span: 0.235,
      // Staggered starts and slightly different speeds, so the names never
      // line up into a single rotating spoke.
      phase: (i * 0.37) % 1,
      speed: 0.014 + ((i * 7) % 5) * 0.0035,
    }))
  }, [labels, radii, wide])

  /* One loop drives every label, and only while the pattern is on screen. */
  useEffect(() => {
    if (reduced || riders.length === 0) return
    const el = svg.current
    if (!el) return

    let raf = 0
    let last = performance.now()
    const at = riders.map((r) => r.phase)
    let visible = true

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      for (let i = 0; i < riders.length; i++) {
        const r = riders[i]
        at[i] = (at[i] + r.speed * dt * 10) % 1
        marks.current[i]?.setAttribute(
          'startOffset',
          `${((r.from + at[i] * r.span) * 100).toFixed(3)}%`,
        )
      }
      raf = requestAnimationFrame(tick)
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting === visible) return
        visible = entry.isIntersecting
        if (visible) {
          last = performance.now()
          raf = requestAnimationFrame(tick)
        } else {
          cancelAnimationFrame(raf)
        }
      },
      { threshold: 0 },
    )
    io.observe(el)
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
    }
  }, [reduced, riders])

  return (
    <svg
      ref={svg}
      aria-hidden
      focusable="false"
      className={className}
      viewBox={`0 0 ${W} ${H}`}
      // Anchored to the corner the rings radiate from, so the focus stays put
      // whatever the section's aspect: centring it instead throws the focus
      // off-screen on a tall narrow layout and the arcs flatten to diagonals.
      preserveAspectRatio="xMaxYMax slice"
      style={{ opacity }}
    >
      <defs>
        <linearGradient id={`${uid}-stroke`} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--color-azure-500)" />
          <stop offset="52%" stopColor="var(--color-iris-500)" />
          <stop offset="100%" stopColor="var(--color-iris-300)" />
        </linearGradient>

        {/* Fade with distance from the focus, so the long ends of the outer
            rings dissolve instead of running off the side of the section. */}
        <radialGradient
          id={`${uid}-fade`}
          gradientUnits="userSpaceOnUse"
          cx={cx}
          cy={cy}
          r={far}
        >
          <stop offset="0%" stopColor="#fff" stopOpacity="1" />
          <stop offset="55%" stopColor="#fff" stopOpacity="0.85" />
          <stop offset="84%" stopColor="#fff" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <mask id={`${uid}-mask`} maskUnits="userSpaceOnUse" x="0" y="0" width={W} height={H}>
          <rect width={W} height={H} fill={`url(#${uid}-fade)`} />
        </mask>

        {/* Held back across the top, where the section's heading and standfirst
            sit. A single bright arc crossing 16px body copy is enough to drop
            it under 4.5:1, and the pattern is worth nothing at that price. */}
        <linearGradient id={`${uid}-vert`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity={String(headroom)} />
          <stop offset="30%" stopColor="#fff" stopOpacity={String(headroom + 0.16)} />
          <stop offset="58%" stopColor="#fff" stopOpacity="1" />
        </linearGradient>
        <mask id={`${uid}-vmask`} maskUnits="userSpaceOnUse" x="0" y="0" width={W} height={H}>
          <rect width={W} height={H} fill={`url(#${uid}-vert)`} />
        </mask>

        {/* Rings as paths rather than ellipses: a textPath can only follow a
            path. Drawn clockwise from the right, which puts the glyphs the
            right way up along the upper-left sweep — the part on screen. */}
        {radii.map((r, i) => {
          const rx = r
          const ry = r * squash
          return (
            <path
              key={r}
              id={`${uid}-r${i}`}
              d={`M ${cx + rx} ${cy} A ${rx} ${ry} 0 1 1 ${cx - rx} ${cy} A ${rx} ${ry} 0 1 1 ${cx + rx} ${cy}`}
            />
          )
        })}
      </defs>

      {/* Nested masks multiply, so the rings are shaped by distance from the
          focus and by how far down the section they fall. */}
      <g mask={`url(#${uid}-vmask)`}>
        <g mask={`url(#${uid}-mask)`} transform={`rotate(${tilt} ${cx} ${cy})`}>
          <g fill="none" stroke={`url(#${uid}-stroke)`}>
            {radii.map((r, i) => (
              <use
                key={r}
                href={`#${uid}-r${i}`}
                // Inner rings read as the crest and carry the weight; the outer
                // ones are the falloff.
                strokeWidth={i < 3 ? 1.5 : 1.1}
                strokeOpacity={0.9 - i * 0.028}
              />
            ))}
          </g>

          <g
            fill="var(--color-iris-300)"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 15,
              letterSpacing: '0.24em',
            }}
          >
            {riders.map((rider, i) => (
              <text key={rider.text} fillOpacity={0.85} dy={-7}>
                <textPath
                  ref={(node) => {
                    marks.current[i] = node
                  }}
                  href={`#${uid}-r${rider.ring}`}
                  startOffset={`${((rider.from + rider.phase * rider.span) * 100).toFixed(3)}%`}
                >
                  {rider.text.toUpperCase()}
                </textPath>
              </text>
            ))}
          </g>
        </g>
      </g>
    </svg>
  )
}
