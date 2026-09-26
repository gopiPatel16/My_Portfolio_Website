import { useRef } from 'react'
import { useInView } from 'motion/react'
import { ArrowRight, ArrowUpRight, Mail } from 'lucide-react'
import { GithubIcon, LinkedinIcon } from '../BrandIcons'
import { heroStats, profile } from '../../data/profile'
import { ActionLink, Reveal } from '../primitives'
import { useCountUp } from '../../hooks'

function Stat({ value, label, active }: { value: number; label: string; active: boolean }) {
  const n = useCountUp(value, active)
  return (
    <div>
      <dd className="display text-[clamp(1.5rem,2.8vw,2.2rem)] text-paper-50 tabular-nums">
        {String(Math.round(n)).padStart(2, '0')}
      </dd>
      <dt className="label mt-1.5 leading-relaxed">{label}</dt>
    </div>
  )
}

/** The recruiter-facing summary, kept out of the title card's composition. */
export function StatsBand() {
  const ref = useRef<HTMLDListElement>(null)
  const seen = useInView(ref, { once: true, margin: '-10% 0px' })

  return (
    <section className="relative py-14 md:py-20">
      <div className="shell">
        <div className="grid gap-x-14 gap-y-10 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-[var(--edge)] bg-white/[0.03] px-3 py-1">
                <span className="h-1.5 w-1.5 rounded-full bg-azure-400" />
                <span className="font-mono text-[10px] tracking-[0.18em] text-paper-200">
                  OPEN TO AI / GENAI ROLES
                </span>
              </span>
            </Reveal>
            <Reveal delay={0.05}>
              <p className="mt-6 max-w-[52ch] text-[15px] leading-relaxed text-paper-200 md:text-[17px]">
                {profile.statement} I design the prompts, evaluate what the models give back, and
                build the systems around them — then ship the software with AI-assisted
                development.
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <ActionLink href="#work" variant="grad">
                  Explore my work
                  <ArrowRight size={15} strokeWidth={2.2} className="transition-transform duration-300 group-hover:translate-x-1" />
                </ActionLink>
                <ActionLink href="#contact">
                  Let’s connect
                  <ArrowUpRight size={15} strokeWidth={2.2} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </ActionLink>
              </div>
            </Reveal>
            <Reveal delay={0.15}>
              <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
                {[
                  { href: profile.linkedin, Icon: LinkedinIcon, label: 'LinkedIn', ext: true },
                  { href: profile.github, Icon: GithubIcon, label: 'GitHub', ext: true },
                  { href: `mailto:${profile.email}`, Icon: Mail, label: profile.email, ext: false },
                ].map(({ href, Icon, label, ext }) => (
                  <a
                    key={label}
                    href={href}
                    {...(ext ? { target: '_blank', rel: 'noreferrer noopener' } : {})}
                    className="group inline-flex items-center gap-2 text-[13px] text-paper-400 transition-colors duration-300 hover:text-paper-50"
                  >
                    <Icon size={14} strokeWidth={1.7} className="transition-colors group-hover:text-iris-300" />
                    <span className="border-b border-transparent pb-px transition-colors duration-300 group-hover:border-iris-400">
                      {label}
                    </span>
                  </a>
                ))}
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.1} className="lg:col-span-5 lg:col-start-8">
            <dl ref={ref} className="grid grid-cols-2 gap-x-8 gap-y-8 border-t border-[var(--edge)] pt-8">
              {heroStats.map((s) => (
                <Stat key={s.label} value={s.value} label={s.label} active={seen} />
              ))}
            </dl>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
