import Lenis from 'lenis'
import { useEffect, useRef, useState, type RefObject } from 'react'

function useMedia(query: string, initial: boolean) {
  const [matches, setMatches] = useState(() =>
    typeof window === 'undefined' ? initial : window.matchMedia(query).matches,
  )
  useEffect(() => {
    const mq = window.matchMedia(query)
    const onChange = () => setMatches(mq.matches)
    onChange()
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [query])
  return matches
}

/** Live-updating prefers-reduced-motion, defaulting to reduced until known. */
export const useReducedMotion = () => useMedia('(prefers-reduced-motion: reduce)', true)

/** True while the device reports a fine pointer (mouse / trackpad). */
export const useFinePointer = () => useMedia('(pointer: fine)', false)

export const useMinWidth = (px: number) => useMedia(`(min-width: ${px}px)`, false)

/**
 * The live Lenis instance, so a full-screen overlay can freeze the page behind
 * it. Lenis listens on the window, so `overflow: hidden` on the body does not
 * stop it on its own.
 */
let smooth: Lenis | null = null

/** Back to the top, gliding with Lenis where it runs and jumping where it does not. */
export function scrollToTop() {
  if (smooth) smooth.scrollTo(0)
  else window.scrollTo({ top: 0 })
}

export function pauseSmoothScroll(paused: boolean) {
  if (paused) smooth?.stop()
  else smooth?.start()
}

/** Inertial scroll, disabled entirely under reduced motion. */
export function useSmoothScroll() {
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced) return
    const lenis = new Lenis({
      duration: 1.05,
      easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.6,
    })
    smooth = lenis
    let frame = requestAnimationFrame(function raf(time) {
      lenis.raf(time)
      frame = requestAnimationFrame(raf)
    })

    // Hash links hand off to Lenis rather than jumping.
    const onClick = (e: MouseEvent) => {
      const link = (e.target as HTMLElement)?.closest?.('a[href^="#"]')
      if (!link) return
      const id = link.getAttribute('href')
      if (!id || id === '#') return
      const target = document.querySelector(id)
      if (!target) return
      e.preventDefault()
      lenis.scrollTo(target as HTMLElement, { offset: -84 })
    }
    document.addEventListener('click', onClick)

    return () => {
      document.removeEventListener('click', onClick)
      cancelAnimationFrame(frame)
      lenis.destroy()
      smooth = null
    }
  }, [reduced])
}

/** The id of the section currently at the reading position. */
export function useActiveSection(ids: readonly string[]): string {
  const [active, setActive] = useState(ids[0] ?? '')

  useEffect(() => {
    const onScroll = () => {
      const sections = ids
        .map((id) => document.getElementById(id))
        .filter((el): el is HTMLElement => el !== null)
      if (!sections.length) return
      const line = window.innerHeight * 0.35
      let current = sections[0].id
      for (const el of sections) {
        if (el.getBoundingClientRect().top <= line) current = el.id
      }
      if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 4) {
        current = sections[sections.length - 1].id
      }
      setActive(current)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [ids])

  return active
}

/** Document scroll progress, 0 to 1. */
export function useScrollProgress(): number {
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const max = document.documentElement.scrollHeight - window.innerHeight
      setProgress(max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0)
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])
  return progress
}

export function useScrolledPast(px: number): boolean {
  const [past, setPast] = useState(false)
  useEffect(() => {
    const onScroll = () => setPast(window.scrollY > px)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [px])
  return past
}

/** How far the viewport has travelled through an element, 0 to 1. */
export function useSectionProgress(ref: RefObject<HTMLElement | null>): number {
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    let frame = 0
    const update = () => {
      frame = 0
      const rect = el.getBoundingClientRect()
      const travel = rect.height - window.innerHeight
      if (travel <= 0) return setProgress(rect.top <= 0 ? 1 : 0)
      setProgress(Math.min(1, Math.max(0, -rect.top / travel)))
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [ref])
  return progress
}

/** Counts up to `value` once `active`. Returns the value directly if reduced. */
export function useCountUp(value: number, active: boolean, ms = 1300): number {
  const [n, setN] = useState(0)
  const reduced = useReducedMotion()
  useEffect(() => {
    if (!active || reduced) return
    let frame = 0
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / ms)
      setN(value * (t === 1 ? 1 : 1 - 2 ** (-9 * t)))
      if (t < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [value, active, ms, reduced])
  if (reduced) return active ? value : 0
  return n
}

/** Scrolls to the top on route change, unless the browser restored a position. */
export function useScrollTopOnRoute(key: string) {
  const first = useRef(true)
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    window.scrollTo(0, 0)
  }, [key])
}
