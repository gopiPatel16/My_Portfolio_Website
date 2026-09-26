import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, ArrowUpRight, Camera, FileText } from 'lucide-react'
import { GithubIcon } from '../components/BrandIcons'
import { bySlug, projects } from '../data/projects'
import { CaptionedShot, Reveal, Tags } from '../components/primitives'
import { FlowField } from '../components/FlowField'
import { usePdfPreview } from '../components/pdf-preview-context'
import { useScrollTopOnRoute } from '../hooks'
import type { ReactNode } from 'react'

function Block({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="label text-iris-400">{label}</p>
      <p className="mt-2.5 text-[14.5px] leading-relaxed text-paper-200">{children}</p>
    </div>
  )
}

export default function ProjectPage() {
  const preview = usePdfPreview()
  const { slug = '' } = useParams()
  useScrollTopOnRoute(slug)
  const project = bySlug(slug)

  if (!project) {
    return (
      <main className="shell flex min-h-svh flex-col items-center justify-center gap-6 text-center">
        <h1 className="display text-[2rem] text-paper-50">Project not found</h1>
        <Link
          to="/#work"
          className="inline-flex items-center gap-2 rounded-full border border-[var(--edge-strong)] px-5 py-2.5 text-[13.5px] text-paper-200 hover:text-paper-50"
        >
          <ArrowLeft size={14} strokeWidth={2} />
          Back to all projects
        </Link>
      </main>
    )
  }

  const i = projects.findIndex((p) => p.slug === slug)
  const next = projects[(i + 1) % projects.length]

  return (
    <main>
      {/* ---------------- Hero ---------------- */}
      <header className="relative overflow-hidden pt-28 pb-12 md:pt-36 md:pb-16">
        <div aria-hidden className="absolute inset-0 -z-10">
          <FlowField className="absolute inset-0 h-full w-full" strands={22} opacity={0.7} />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg, rgba(5,4,13,0.85) 0%, rgba(5,4,13,0.3) 30%, rgba(5,4,13,0.95) 100%)',
            }}
          />
        </div>

        <div className="shell">
          <Link
            to="/#work"
            className="group inline-flex items-center gap-2 text-[13px] text-paper-400 transition-colors hover:text-paper-50"
          >
            <ArrowLeft size={14} strokeWidth={2} className="transition-transform duration-300 group-hover:-translate-x-1" />
            All projects
          </Link>

          <div className="mt-8 grid gap-x-14 gap-y-6 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <div className="flex flex-wrap items-center gap-3">
                <span className="label">{project.kind}</span>
                <span className="label text-paper-800">{project.year}</span>
                {project.liveCaptured && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-azure-500/40 bg-azure-500/12 px-2.5 py-1 font-mono text-[9.5px] tracking-[0.14em] text-azure-400">
                    <Camera size={10} strokeWidth={2} />
                    CAPTURED LIVE
                  </span>
                )}
              </div>
              <h1 className="display mt-4 text-[clamp(2rem,5vw,3.6rem)] text-paper-50">
                {project.name}
              </h1>
              <p className="mt-5 max-w-[52ch] text-[15px] leading-relaxed text-paper-200">
                {project.tagline}
              </p>
            </div>

            <div className="lg:col-span-4 lg:col-start-9">
              <dl className="grid grid-cols-2 gap-x-6 gap-y-5">
                {project.metrics.map((m) => (
                  <div key={m.label}>
                    <dd className="display text-[1.5rem] text-paper-50">{m.value}</dd>
                    <dt className="label mt-0.5 text-[10px] leading-relaxed">{m.label}</dt>
                  </div>
                ))}
              </dl>
              <div className="mt-6 flex flex-wrap items-center gap-5">
                {project.report && (
                  <a
                    href={project.report}
                    target="_blank"
                    rel="noreferrer noopener"
                    onClick={preview({
                      src: project.report,
                      title: `${project.name} — technical report`,
                    })}
                    className="group inline-flex items-center gap-2 text-[13px] text-paper-200 transition-colors hover:text-paper-50"
                  >
                    <FileText size={14} strokeWidth={1.8} className="text-iris-300" />
                    Technical report
                    <ArrowUpRight size={12} strokeWidth={2} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </a>
                )}
                {project.source && (
                  <a href={project.source} target="_blank" rel="noreferrer noopener" className="group inline-flex items-center gap-2 text-[13px] text-paper-200 transition-colors hover:text-paper-50">
                    <GithubIcon size={14} className="text-iris-300" />
                    Source
                    <ArrowUpRight size={12} strokeWidth={2} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ---------------- Lead visual ---------------- */}
      {project.images[0] && (
        <div className="shell">
          <Reveal>
            <div className="relative">
              <div
                aria-hidden
                className="absolute -inset-8 -z-10 rounded-[2rem] opacity-60 blur-3xl"
                style={{ background: 'radial-gradient(50% 50% at 50% 45%, rgba(139,92,246,0.3), transparent 72%)' }}
              />
              <CaptionedShot shot={project.images[0]} priority />
            </div>
          </Reveal>
        </div>
      )}

      {/* ---------------- Story ---------------- */}
      <section className="shell py-16 md:py-24">
        <div className="grid gap-x-14 gap-y-10 lg:grid-cols-12">
          <div className="space-y-8 lg:col-span-7">
            <Reveal><Block label="The problem">{project.problem}</Block></Reveal>
            <Reveal delay={0.05}><Block label="The idea">{project.idea}</Block></Reveal>
            <Reveal delay={0.1}><Block label="The approach">{project.approach}</Block></Reveal>
            <Reveal delay={0.15}><Block label="The result">{project.result}</Block></Reveal>
            <Reveal delay={0.2}><Block label="My contribution">{project.contribution}</Block></Reveal>
            {project.challenges && (
              <Reveal delay={0.25}><Block label="Challenges">{project.challenges}</Block></Reveal>
            )}
            {project.learnings && (
              <Reveal delay={0.3}><Block label="What I took from it">{project.learnings}</Block></Reveal>
            )}
          </div>

          <div className="lg:col-span-4 lg:col-start-9">
            <Reveal delay={0.08}>
              <div className="panel p-6">
                <p className="label">Key features</p>
                <ul className="mt-4 space-y-2.5">
                  {project.features.map((f) => (
                    <li key={f} className="flex gap-2.5 text-[13px] leading-relaxed text-paper-400">
                      <span aria-hidden className="mt-[0.5em] h-1 w-1 shrink-0 rounded-full bg-iris-400" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            <Reveal delay={0.14}>
              <div className="panel mt-4 p-6">
                <p className="label">Technology</p>
                <div className="mt-4">
                  <Tags items={project.stack} />
                </div>
              </div>
            </Reveal>

            {project.architecture && (
              <Reveal delay={0.2}>
                <div className="panel mt-4 p-6">
                  <p className="label">Architecture</p>
                  <ol className="mt-4 space-y-0">
                    {project.architecture.map((a, k) => (
                      <li key={a.layer}>
                        <div className="rounded-lg border border-[var(--edge)] bg-ink-950/50 px-4 py-3">
                          <p className="font-mono text-[10px] tracking-[0.16em] text-iris-300">
                            {a.layer.toUpperCase()}
                          </p>
                          <p className="mt-1.5 text-[12px] leading-relaxed text-paper-400">{a.detail}</p>
                        </div>
                        {k < project.architecture!.length - 1 && (
                          <div aria-hidden className="flex justify-center py-1.5">
                            <span className="h-3 w-px bg-[var(--edge-strong)]" />
                          </div>
                        )}
                      </li>
                    ))}
                  </ol>
                </div>
              </Reveal>
            )}
          </div>
        </div>
      </section>

      {/* ---------------- AI workflow ---------------- */}
      <section className="shell pb-16 md:pb-24">
        <Reveal>
          <div className="panel overflow-hidden">
            <div className="border-b border-[var(--edge)] bg-linear-to-r from-azure-500/10 to-iris-500/10 px-6 py-4 md:px-8">
              <p className="label">How AI was used here</p>
            </div>
            <ol className="grid gap-px bg-[var(--edge)] md:grid-cols-2">
              {project.aiWorkflow.map((step, k) => (
                <li key={k} className="flex gap-4 bg-ink-900/60 px-6 py-5 md:px-8">
                  <span className="display shrink-0 text-[13px] text-iris-400">
                    {String(k + 1).padStart(2, '0')}
                  </span>
                  <p className="text-[13.5px] leading-relaxed text-paper-400">{step}</p>
                </li>
              ))}
            </ol>
          </div>
        </Reveal>
      </section>

      {/* ---------------- Gallery ---------------- */}
      {project.images.length > 1 && (
        <section className="shell pb-16 md:pb-24">
          <Reveal>
            <div className="mb-8 flex flex-wrap items-baseline justify-between gap-4 border-t border-[var(--edge)] pt-8">
              <h2 className="display text-[clamp(1.3rem,2.4vw,1.8rem)] text-paper-50">
                The application
              </h2>
              <span className="label">
                {project.liveCaptured ? 'Captured from the running build' : 'From the project’s own documentation'}
              </span>
            </div>
          </Reveal>

          <div
            className={
              project.images[1]?.frame === 'phone'
                ? 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3'
                : 'grid gap-10 lg:grid-cols-2'
            }
          >
            {project.images.slice(1).map((shot, k) => (
              <Reveal key={shot.src} delay={k * 0.05}>
                <CaptionedShot shot={shot} />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* ---------------- Next ---------------- */}
      <section className="shell pb-20 md:pb-28">
        <Reveal>
          <Link
            to={`/projects/${next.slug}`}
            className="panel panel-hover group flex flex-wrap items-center justify-between gap-6 p-6 md:p-8"
          >
            <div>
              <p className="label">Next project</p>
              <p className="display mt-2 text-[clamp(1.2rem,2.4vw,1.8rem)] text-paper-50">
                {next.name}
              </p>
            </div>
            <span className="grid h-11 w-11 place-items-center rounded-full border border-[var(--edge-strong)] text-paper-200 transition-all duration-300 group-hover:border-iris-400 group-hover:bg-iris-500/12 group-hover:text-paper-50">
              <ArrowRight size={16} strokeWidth={2} />
            </span>
          </Link>
        </Reveal>
      </section>
    </main>
  )
}
