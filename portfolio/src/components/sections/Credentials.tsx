import type { ReactNode } from 'react'
import { BadgeCheck, Briefcase, FileText, GraduationCap } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { certifications, experience } from '../../data/credentials'
import { education } from '../../data/skills'
import { usePdfPreview } from '../pdf-preview-context'
import { Reveal, SectionHeader } from '../primitives'
import { DocPhoto } from '../DocPhoto'

/* ------------------------------------------------------------------ *
 * Education & experience — degrees, the internship and certifications,
 * each with the document behind it.
 * ------------------------------------------------------------------ */

function GroupTitle({ Icon, children, first = false }: { Icon: LucideIcon; children: ReactNode; first?: boolean }) {
  return (
    <Reveal>
      <h3 className={`flex items-center gap-3 ${first ? '' : 'mt-16 md:mt-20'}`}>
        <span className="grid h-9 w-9 place-items-center rounded-xl border border-[var(--edge-strong)] bg-iris-500/10 text-iris-300">
          <Icon size={16} strokeWidth={1.8} />
        </span>
        <span className="display text-[20px] text-paper-50 md:text-[22px]">{children}</span>
      </h3>
    </Reveal>
  )
}

const docButton =
  'inline-flex items-center gap-1.5 rounded-full border border-[var(--edge-strong)] px-3.5 py-1.5 text-[12.5px] text-paper-200 transition-colors hover:border-iris-400 hover:bg-iris-500/12 hover:text-paper-50'

const row = 'group grid items-baseline gap-x-8 gap-y-2 border-b border-[var(--edge)] py-7 md:grid-cols-12 md:py-8'
const year =
  'display text-[clamp(1.9rem,4vw,3rem)] leading-none text-paper-800 transition-colors duration-500 group-hover:text-iris-400/70 md:col-span-2'

export function EducationExperience() {
  const preview = usePdfPreview()

  return (
    <section id="education" className="relative scroll-mt-24 py-20 md:py-28">
      <div className="shell">
        <SectionHeader
          index="05"
          label="Education & experience"
          title={<>Where I studied, worked and trained</>}
          lede="Two degrees, an internship and completed certifications. Each one opens the document it comes from, right here on the page."
        />

        {/* ---------------- Education ---------------- */}
        <GroupTitle Icon={GraduationCap} first>
          Education
        </GroupTitle>
        <ol className="mt-6 border-t border-[var(--edge)]">
          {education.map((item, i) => (
            <Reveal key={item.year} delay={i * 0.06} as="li">
              <div className={row}>
                <span className={year}>{item.year}</span>
                <div className="md:col-span-7">
                  <h4 className="display text-[17px] text-paper-50 md:text-[19px]">{item.degree}</h4>
                  <p className="mt-1.5 text-[14px] text-paper-400">
                    {item.institution} — {item.place}
                  </p>
                </div>
                <p className="label leading-relaxed md:col-span-3 md:text-right">{item.note}</p>
              </div>
            </Reveal>
          ))}
        </ol>

        {/* ---------------- Experience ---------------- */}
        <GroupTitle Icon={Briefcase}>Experience</GroupTitle>
        <ol className="mt-6 border-t border-[var(--edge)]">
          {experience.map((job) => (
            <Reveal key={job.role} as="li">
              <div className={row}>
                <span className={year}>{job.year}</span>
                <div className="md:col-span-7">
                  <h4 className="display text-[17px] text-paper-50 md:text-[19px]">{job.role}</h4>
                  <p className="mt-1.5 text-[14px] text-paper-400">
                    {job.org} — {job.place}
                  </p>
                  <ul className="mt-5 space-y-1.5">
                    {job.scope.map((line) => (
                      <li key={line} className="flex gap-2.5 text-[13.5px] leading-relaxed text-paper-200">
                        <span aria-hidden className="mt-[0.6em] h-1 w-1 shrink-0 rounded-full bg-iris-400" />
                        {line}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex flex-col gap-4 md:col-span-3 md:items-end md:text-right">
                  <p className="label leading-relaxed">{job.term}</p>
                  {/* The letter itself, as a sheet of paper: click it to read
                      it full size. */}
                  <DocPhoto
                    doc={job.photo}
                    thumb={job.photo.thumb}
                    caption="Offer letter"
                    alt={`Offer letter from ${job.org}`}
                    label="Open my offer letter full size"
                  />
                </div>
              </div>
            </Reveal>
          ))}
        </ol>

        {/* ---------------- Certifications ---------------- */}
        <GroupTitle Icon={BadgeCheck}>Certifications</GroupTitle>
        <ul className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {certifications.map((cert, i) => (
            <Reveal key={cert.title} delay={i * 0.06} as="li" className="h-full">
              <article className="panel flex h-full flex-col overflow-hidden">
                <img
                  src={cert.thumb}
                  alt={`${cert.title} certificate issued by ${cert.issuer}`}
                  loading="lazy"
                  decoding="async"
                  className="aspect-[4/3] w-full border-b border-[var(--edge)] bg-ink-950 object-cover"
                />
                <div className="flex flex-1 flex-col p-5">
                  <p className="label text-iris-300">{cert.issuer}</p>
                  <h4 className="display mt-2 text-[17px] leading-snug text-paper-50">{cert.title}</h4>
                  <p className="mt-2 font-mono text-[11px] tracking-[0.08em] text-paper-400">
                    {cert.date ? `Issued ${cert.date}` : 'Certificate of completion'}
                    {cert.credentialId && ` · ID ${cert.credentialId}`}
                  </p>
                  <div className="mt-auto flex flex-wrap items-center gap-3 pt-5">
                    <a
                      href={cert.doc.src}
                      target="_blank"
                      rel="noreferrer noopener"
                      onClick={preview(cert.doc)}
                      className={docButton}
                    >
                      <FileText size={13} strokeWidth={1.8} className="text-iris-300" />
                      View certificate
                    </a>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}
