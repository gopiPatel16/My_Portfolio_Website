import { ArrowUpRight, BadgeCheck, FileText } from 'lucide-react'
import { research } from '../../data/research'
import { usePdfPreview } from '../pdf-preview-context'
import { Reveal, SectionHeader } from '../primitives'

/** Decorative spectrogram. It illustrates the subject; it is not measured data. */
function Waveform() {
  const bars = 110
  return (
    <svg
      viewBox="0 0 480 110"
      className="h-24 w-full md:h-32"
      role="img"
      aria-label="Stylised audio waveform illustrating the research subject"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="rw" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#4c6fff" stopOpacity="0.12" />
          <stop offset="40%" stopColor="#4c6fff" stopOpacity="0.9" />
          <stop offset="52%" stopColor="#a855f7" stopOpacity="1" />
          <stop offset="64%" stopColor="#676a86" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#676a86" stopOpacity="0.12" />
        </linearGradient>
      </defs>
      {Array.from({ length: bars }, (_, i) => {
        const t = i / bars
        const env = Math.sin(t * Math.PI) ** 0.65
        const jitter = Math.abs(Math.sin(i * 12.9898) * 43758.5453) % 1
        const h = Math.max(3, env * (12 + jitter * 84))
        return (
          <rect
            key={i}
            x={i * (480 / bars) + 0.9}
            y={55 - h / 2}
            width={480 / bars - 1.8}
            height={h}
            rx={0.8}
            fill="url(#rw)"
          />
        )
      })}
      {/* The boundary the paper is about: genuine on one side, synthetic on the other. */}
      <line x1="250" y1="0" x2="250" y2="110" stroke="rgba(255,255,255,0.16)" strokeDasharray="3 5" />
    </svg>
  )
}

export function Research() {
  const preview = usePdfPreview()

  return (
    <section id="research" className="relative scroll-mt-24 py-20 md:py-28">
      <div className="shell">
        <SectionHeader
          index="04"
          label="Research"
          title={<>Research paper on deepfake audio</>}
          lede="A study of AI-based methods for detecting deepfake audio, co-authored at MIT Manipal and accepted at IEEE ICCCNT 2025."
        />

        <Reveal>
          <article className="panel overflow-hidden">
            {/* Publication banner */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-3 border-b border-[var(--edge)] bg-linear-to-r from-azure-500/12 to-iris-500/10 px-6 py-4 md:px-8">
              <span className="inline-flex items-center gap-2 rounded-full border border-azure-500/45 bg-azure-500/15 px-3 py-1 text-[12px] font-medium text-azure-400">
                <BadgeCheck size={14} strokeWidth={2} />
                {research.status} — {research.venueShort}
              </span>
              <span className="font-mono text-[10.5px] tracking-[0.14em] text-paper-400">
                PAPER ID {research.paperId}
              </span>
              <span className="font-mono text-[10.5px] tracking-[0.14em] text-paper-600">
                {research.host.toUpperCase()} · {research.dates.toUpperCase()}
              </span>
            </div>

            <div className="grid gap-x-12 gap-y-8 px-6 py-8 md:grid-cols-12 md:px-8 md:py-10">
              <div className="md:col-span-7">
                <p className="label">Research paper</p>
                <h3 className="display mt-3 max-w-[22ch] text-[clamp(1.4rem,2.8vw,2.1rem)] text-paper-50">
                  {research.title}
                </h3>
                <p className="mt-4 text-[13.5px] text-paper-400">
                  {research.authors.map((a, i) => (
                    <span key={a.label}>
                      {i > 0 && ', '}
                      <span className={a.named ? 'text-paper-50' : 'italic'}>{a.label}</span>
                    </span>
                  ))}
                  {' · '}
                  {research.affiliation}
                </p>
                <p className="mt-5 max-w-[58ch] text-[14px] leading-relaxed text-paper-200">
                  {research.abstract}
                </p>

                <div className="mt-7 flex flex-wrap items-center gap-5">
                  <a
                    href={research.paperPdf}
                    target="_blank"
                    rel="noreferrer noopener"
                    onClick={preview({ src: research.paperPdf, title: research.title })}
                    className="group inline-flex items-center gap-2 rounded-full border border-[var(--edge-strong)] px-5 py-2.5 text-[13px] text-paper-50 transition-all duration-300 hover:-translate-y-0.5 hover:border-iris-400 hover:bg-iris-500/12"
                  >
                    <FileText size={14} strokeWidth={1.8} className="text-iris-300" />
                    Read the paper
                    <ArrowUpRight size={13} strokeWidth={2} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </a>
                  <a
                    href={research.acceptancePdf}
                    target="_blank"
                    rel="noreferrer noopener"
                    onClick={preview({
                      src: research.acceptancePdf,
                      title: `${research.venueShort} — acceptance letter`,
                    })}
                    className="group inline-flex items-center gap-2 text-[13px] text-paper-400 transition-colors hover:text-paper-50"
                  >
                    Acceptance letter
                    <ArrowUpRight size={12} strokeWidth={2} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </a>
                </div>
              </div>

              <dl className="md:col-span-4 md:col-start-9">
                <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                  {research.scale.map((s) => (
                    <div key={s.label}>
                      <dt className="display text-[1.5rem] text-paper-50">{s.value}</dt>
                      <dd className="label mt-1 text-[10px] leading-relaxed">{s.label}</dd>
                    </div>
                  ))}
                </div>
                <div className="mt-7 space-y-2.5 border-t border-[var(--edge)] pt-5 text-[12px] text-paper-600">
                  <p>
                    <span className="text-paper-400">Accepted </span>
                    {research.acceptedOn}
                  </p>
                  <p>
                    <span className="text-paper-400">Programme </span>
                    {research.slot}
                  </p>
                </div>
              </dl>
            </div>

            <div className="border-y border-[var(--edge)] px-6 py-6 md:px-8">
              <Waveform />
            </div>

            {/* Findings */}
            <div className="grid gap-px bg-[var(--edge)] md:grid-cols-3">
              {research.findings.map((f) => (
                <div key={f.n} className="bg-ink-900/60 px-6 py-6 md:px-7">
                  <span className="font-mono text-[11px] tracking-[0.16em] text-iris-400">{f.n}</span>
                  <h4 className="display mt-3 text-[14.5px] leading-snug text-paper-50">{f.title}</h4>
                  <p className="mt-2.5 text-[12.5px] leading-relaxed text-paper-400">{f.body}</p>
                </div>
              ))}
            </div>

            <p className="px-6 py-6 text-[13px] leading-relaxed text-paper-400 md:px-8">
              <span className="text-paper-200">Conclusion. </span>
              {research.conclusion}
            </p>
          </article>
        </Reveal>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ *
 * Education
 * ------------------------------------------------------------------ */
