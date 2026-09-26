import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { ArrowUpRight, Download, X } from 'lucide-react'
import { PdfPreviewCtx, type PreviewDoc } from './pdf-preview-context'
import { pauseSmoothScroll, useReducedMotion } from '../hooks'

/** The on-site document reader, and the click handler that opens it. */
export function PdfPreviewProvider({ children }: { children: ReactNode }) {
  const [doc, setDoc] = useState<PreviewDoc | null>(null)
  const reduced = useReducedMotion()
  const closer = useRef<HTMLButtonElement>(null)
  const returnTo = useRef<HTMLElement | null>(null)

  const preview = useCallback(
    (next: PreviewDoc) => (e: MouseEvent) => {
      // Anything that asks for a new tab or a save gets exactly that.
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
        return
      }
      e.preventDefault()
      returnTo.current = e.currentTarget as HTMLElement
      setDoc(next)
    },
    [],
  )

  const close = useCallback(() => setDoc(null), [])

  useEffect(() => {
    if (!doc) return

    // Lenis listens on the window, so hiding the body is not enough on its own
    // — the page would still glide along behind the reader.
    pauseSmoothScroll(true)
    const { overflow, paddingRight } = document.body.style
    const bar = window.innerWidth - document.documentElement.clientWidth
    document.body.style.overflow = 'hidden'
    if (bar > 0) document.body.style.paddingRight = `${bar}px`

    // aria-modal only tells assistive tech the page is inert; `inert` makes it
    // true. Cycling Tab by hand cannot work here — once focus is inside the
    // PDF frame it belongs to another document and the keys are unobservable,
    // so when the viewer's own tab order runs out focus escapes behind the
    // overlay. Taking the app out of the tab order is the only thing that
    // actually holds. The reader is portalled to the body so it survives.
    const app = document.getElementById('root')
    app?.setAttribute('inert', '')

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('keydown', onKey)
    const focus = window.setTimeout(() => closer.current?.focus(), 60)

    return () => {
      document.removeEventListener('keydown', onKey)
      app?.removeAttribute('inert')
      window.clearTimeout(focus)
      document.body.style.overflow = overflow
      document.body.style.paddingRight = paddingRight
      pauseSmoothScroll(false)
      returnTo.current?.focus?.()
    }
  }, [doc, close])

  const value = useMemo(() => preview, [preview])

  return (
    <PdfPreviewCtx.Provider value={value}>
      {children}

      {createPortal(
        <AnimatePresence>
            {doc && (
            <motion.div
              className="fixed inset-0 z-90 flex flex-col bg-ink-950/92 backdrop-blur-xl"
              initial={reduced ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduced ? undefined : { opacity: 0 }}
              transition={{ duration: 0.22 }}
              role="dialog"
              aria-modal="true"
              aria-label={`${doc.title} — document preview`}
              onMouseDown={(e) => {
                if (e.target === e.currentTarget) close()
              }}
            >
              <div className="shell flex min-h-0 flex-1 flex-col py-4 md:py-6">
                <div className="flex items-center justify-between gap-4 pb-3">
                  <p className="min-w-0 truncate text-[13px] text-paper-50">{doc.title}</p>

                  <div className="flex shrink-0 items-center gap-2">
                    {doc.download && (
                      <a
                        href={doc.downloadSrc ?? doc.src}
                        download={doc.download}
                        className="inline-flex items-center gap-1.5 rounded-full border border-iris-400/60 bg-iris-500/15 px-3.5 py-1.5 text-[12px] text-paper-50 transition-colors hover:bg-iris-500/25"
                      >
                        <Download size={12} strokeWidth={2} />
                        Download
                      </a>
                    )}
                    <a
                      href={doc.src}
                      target="_blank"
                      rel="noreferrer noopener"
                      // On a phone three buttons crowd out the title; Download covers it there.
                      className={`${doc.download ? 'hidden sm:inline-flex' : 'inline-flex'} items-center gap-1.5 rounded-full border border-[var(--edge-strong)] px-3.5 py-1.5 text-[12px] text-paper-200 transition-colors hover:border-iris-400 hover:text-paper-50`}
                    >
                      Open in new tab
                      <ArrowUpRight size={12} strokeWidth={2} />
                    </a>
                    <button
                      ref={closer}
                      type="button"
                      onClick={close}
                      aria-label="Close preview"
                      className="grid h-9 w-9 place-items-center rounded-full border border-[var(--edge-strong)] text-paper-200 transition-colors hover:border-iris-400 hover:text-paper-50"
                    >
                      <X size={16} strokeWidth={1.8} />
                    </button>
                  </div>
                </div>

                {doc.kind === 'image' ? (
                  // A page shown as a picture. It is sized to a comfortable
                  // reading width rather than squeezed to fit the window, so
                  // body text stays legible; the box scrolls for the rest.
                  <div className="min-h-0 flex-1 overflow-auto overscroll-contain rounded-2xl border border-[var(--edge)] bg-ink-900 p-3 md:p-5">
                    <img
                      key={doc.src}
                      src={doc.src}
                      width={doc.width}
                      height={doc.height}
                      alt={doc.title}
                      // A minimum width keeps 10pt text readable on a phone; the box
                      // scrolls sideways there rather than shrinking the page
                      // to something nobody can read.
                      className="mx-auto block h-auto w-full max-w-[880px] min-w-[600px] rounded-lg shadow-[0_24px_70px_-20px_rgba(0,0,0,0.85)]"
                    />
                  </div>
                ) : (
                  <div className="min-h-0 flex-1 overflow-hidden rounded-2xl border border-[var(--edge)] bg-ink-900">
                    <iframe
                      // Keyed on the source so switching documents remounts the
                      // frame rather than leaving the previous one on screen.
                      key={doc.src}
                      src={`${doc.src}#view=FitH`}
                      title={doc.title}
                      className="h-full w-full"
                    />
                  </div>
                )}
              </div>
            </motion.div>
            )}
        </AnimatePresence>,
        document.body,
      )}
    </PdfPreviewCtx.Provider>
  )
}
