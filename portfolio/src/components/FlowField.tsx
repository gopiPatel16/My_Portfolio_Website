import { useEffect, useRef } from 'react'
import { useReducedMotion } from '../hooks'

/**
 * The site's living background: a slow ribbon of flowing strands with particles
 * riding the crest, drawn on canvas.
 *
 * Deliberately quiet — the content has to stay the loudest thing on screen.
 * It pauses when scrolled out of view, drops to a single static frame under
 * prefers-reduced-motion, and thins itself out on small screens.
 */
export function FlowField({
  className = '',
  strands = 30,
  height = 1,
  opacity = 1,
}: {
  className?: string
  /** Strand count at desktop width; scaled down on small screens. */
  strands?: number
  /** Vertical scale of the band relative to the canvas. */
  height?: number
  opacity?: number
}) {
  const ref = useRef<HTMLCanvasElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    let raf = 0
    let t = 0
    let visible = true
    let w = 0
    let h = 0
    let dpr = 1
    let count = strands
    const pointer = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 }

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      // Cap DPR: this is a soft background, not a photograph.
      dpr = Math.min(1.5, window.devicePixelRatio || 1)
      w = Math.max(1, Math.round(rect.width))
      h = Math.max(1, Math.round(rect.height))
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      count = w < 700 ? Math.round(strands * 0.5) : w < 1100 ? Math.round(strands * 0.75) : strands
    }

    const spine = (u: number, time: number) =>
      Math.sin(u * Math.PI * 1.6 + time) * 0.17 +
      Math.sin(u * Math.PI * 3.3 + time * 1.45) * 0.05

    const band = (u: number, time: number) =>
      0.06 + Math.abs(Math.sin(u * Math.PI * 1.1 + time * 0.55)) * 0.2

    const draw = () => {
      // Ease the pointer so parallax never snaps.
      pointer.x += (pointer.tx - pointer.x) * 0.045
      pointer.y += (pointer.ty - pointer.y) * 0.045

      ctx.clearRect(0, 0, w, h)

      const midY = h * 0.5 + (pointer.y - 0.5) * h * 0.06
      const drift = (pointer.x - 0.5) * 0.22
      const grad = ctx.createLinearGradient(0, 0, w, h * 0.4)
      grad.addColorStop(0, 'rgba(76,111,255,0.06)')
      grad.addColorStop(0.28, 'rgba(76,111,255,0.8)')
      grad.addColorStop(0.6, 'rgba(168,85,247,1)')
      grad.addColorStop(0.86, 'rgba(201,163,255,0.6)')
      grad.addColorStop(1, 'rgba(107,143,255,0.05)')

      ctx.lineWidth = 0.85
      ctx.strokeStyle = grad

      const step = Math.max(8, Math.round(w / 110))
      for (let i = 0; i < count; i++) {
        const s = count === 1 ? 0.5 : i / (count - 1)
        const offset = (s - 0.5) * 2
        ctx.globalAlpha = (0.1 + Math.sin(s * Math.PI) * 0.72) * opacity
        ctx.beginPath()
        for (let x = 0; x <= w; x += step) {
          const u = x / w + drift
          const y =
            midY +
            spine(u, t) * h * height +
            offset * band(u, t) * h * height +
            Math.sin(u * Math.PI * 4 + s * Math.PI * 2 + t * 1.2) *
              h *
              0.012 *
              (1 - Math.abs(offset))
          if (x === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.stroke()
      }

      // Particles gathered on the upper edge, where the band is widest.
      ctx.globalAlpha = opacity
      for (let i = 0; i < 70; i++) {
        const u = ((i * 0.0143 + t * 0.012) % 1.15) - 0.075
        if (u < 0 || u > 1) continue
        const jitter = Math.abs(Math.sin(i * 12.9898) * 43758.5453) % 1
        const bw = band(u + drift, t)
        const y =
          midY + spine(u + drift, t) * h * height - (0.25 + jitter * 0.72) * bw * h * height
        const r = 0.7 + jitter * 1.6
        ctx.beginPath()
        ctx.arc(u * w, y, r, 0, Math.PI * 2)
        ctx.fillStyle = jitter > 0.55 ? 'rgba(201,163,255,0.85)' : 'rgba(107,143,255,0.7)'
        ctx.globalAlpha = (0.18 + bw * 2.6 * jitter) * opacity
        ctx.fill()
      }
      ctx.globalAlpha = 1
    }

    const loop = () => {
      raf = requestAnimationFrame(loop)
      if (!visible) return
      t += 0.0016
      draw()
    }

    const onPointer = (e: PointerEvent) => {
      pointer.tx = e.clientX / window.innerWidth
      pointer.ty = e.clientY / window.innerHeight
    }

    resize()
    if (reduced) {
      draw()
    } else {
      const io = new IntersectionObserver((entries) => {
        visible = entries[0].isIntersecting
      })
      io.observe(canvas)
      window.addEventListener('pointermove', onPointer, { passive: true })
      raf = requestAnimationFrame(loop)

      const onResize = () => {
        resize()
        draw()
      }
      window.addEventListener('resize', onResize)
      return () => {
        cancelAnimationFrame(raf)
        io.disconnect()
        window.removeEventListener('pointermove', onPointer)
        window.removeEventListener('resize', onResize)
      }
    }

    const onResize = () => {
      resize()
      draw()
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [reduced, strands, height, opacity])

  return <canvas ref={ref} aria-hidden className={className} />
}
