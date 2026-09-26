import { Maximize2 } from 'lucide-react'
import type { PreviewDoc } from './pdf-preview-context'
import { usePdfPreview } from './pdf-preview-context'

/**
 * A document as a small sheet of paper. Clicking it opens the same page full
 * size in the on-site reader. It stays a real link, so ctrl-click and "open in
 * new tab" still reach the picture directly.
 */
export function DocPhoto({
  doc,
  thumb,
  caption,
  alt,
  label,
  className = '',
}: {
  doc: PreviewDoc
  /** Small render of the same page, for the button itself. */
  thumb: string
  /** Sits under the sheet, so the two sheets are told apart at a glance. */
  caption: string
  alt: string
  /** What a screen reader announces for the link. */
  label: string
  className?: string
}) {
  const preview = usePdfPreview()

  return (
    <div className={`flex flex-col items-start gap-2.5 md:items-end ${className}`}>
      <a
        href={doc.src}
        target="_blank"
        rel="noreferrer noopener"
        onClick={preview(doc)}
        data-cursor="view"
        aria-label={label}
        className="group/sheet relative block w-[104px] overflow-hidden rounded-lg border border-[var(--edge-strong)] bg-white shadow-[0_14px_36px_-16px_rgba(0,0,0,0.9)] transition duration-300 hover:-translate-y-0.5 hover:border-iris-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-iris-400"
      >
        <img
          src={thumb}
          width={doc.width}
          height={doc.height}
          alt={alt}
          loading="lazy"
          decoding="async"
          className="block h-auto w-full"
        />
        <span
          aria-hidden
          className="absolute inset-0 grid place-items-center bg-ink-950/60 opacity-0 transition-opacity duration-300 group-hover/sheet:opacity-100"
        >
          <Maximize2 size={15} strokeWidth={2} className="text-paper-50" />
        </span>
      </a>
      <p className="label">{caption}</p>
    </div>
  )
}
