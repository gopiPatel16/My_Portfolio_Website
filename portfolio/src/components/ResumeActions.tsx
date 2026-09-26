import { Download, FileText } from 'lucide-react'
import { profile } from '../data/profile'
import { usePdfPreview } from './pdf-preview-context'

/**
 * View opens the resume in the on-site reader (which also offers a download);
 * Download saves the PDF straight away. Both are real links, so a new-tab click
 * or a right-click save still works.
 */
export function ResumeActions({ className = '', size = 'md' }: { className?: string; size?: 'sm' | 'md' }) {
  const preview = usePdfPreview()
  const pad = size === 'sm' ? 'px-4 py-2 text-[13px]' : 'px-5 py-2.5 text-[14px]'

  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      <a
        href={profile.resume.src}
        target="_blank"
        rel="noreferrer noopener"
        onClick={preview(profile.resume)}
        className={`btn-grad group inline-flex items-center gap-2 rounded-full font-medium text-white transition-transform duration-300 hover:-translate-y-0.5 ${pad}`}
      >
        <FileText size={15} strokeWidth={2} />
        View resume
      </a>
      <a
        href={profile.resume.src}
        download={profile.resume.download}
        className={`inline-flex items-center gap-2 rounded-full border border-[var(--edge-strong)] bg-ink-950/70 text-paper-50 backdrop-blur transition-colors duration-300 hover:border-iris-400 hover:bg-iris-500/15 ${pad}`}
      >
        <Download size={15} strokeWidth={2} />
        Download resume
      </a>
    </div>
  )
}
