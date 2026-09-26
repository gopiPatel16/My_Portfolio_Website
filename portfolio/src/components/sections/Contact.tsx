import { Mail, MapPin, Phone } from 'lucide-react'
import { GithubIcon, LinkedinIcon } from '../BrandIcons'
import { navItems, profile } from '../../data/profile'
import { FlowField } from '../FlowField'
import { ResumeActions } from '../ResumeActions'
import { Reveal } from '../primitives'

export function Contact() {
  const channels = [
    { Icon: Mail, label: 'Email', value: profile.email, href: `mailto:${profile.email}`, ext: false },
    { Icon: Phone, label: 'Phone', value: profile.phone, href: `tel:${profile.phoneHref}`, ext: false },
    { Icon: MapPin, label: 'Location', value: profile.location, href: undefined, ext: false },
  ]

  return (
    <section id="contact" className="relative scroll-mt-24 overflow-hidden py-20 md:py-28">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[70%]"
        style={{
          maskImage: 'linear-gradient(180deg, transparent 0%, #000 55%)',
          WebkitMaskImage: 'linear-gradient(180deg, transparent 0%, #000 55%)',
        }}
      >
        <FlowField className="h-full w-full" strands={24} opacity={0.75} />
      </div>

      <div className="shell">
        <Reveal>
          <div className="flex items-center gap-3">
            <span aria-hidden className="h-px w-7 bg-linear-to-r from-azure-500 to-iris-400" />
            <span className="label">Contact</span>
            <span className="label text-paper-800">06</span>
          </div>
        </Reveal>

        <div className="mt-6 grid gap-x-14 gap-y-12 lg:grid-cols-12">
          <div className="min-w-0 lg:col-span-6">
            <Reveal delay={0.05}>
              <h2 className="display text-[clamp(2.1rem,5vw,3.6rem)] leading-[1.02] text-paper-50">
                Let’s build something
                <br />
                <span className="text-grad">intelligent.</span>
              </h2>
            </Reveal>

            <Reveal delay={0.1}>
              <p className="mt-6 max-w-[44ch] text-[14.5px] leading-relaxed text-paper-400">
                If you are working on AI products, agent workflows, evaluation or automation — or
                you want someone who will write the brief and then build the system around it — I
                would like to hear about it.
              </p>
            </Reveal>

          </div>

          <div className="min-w-0 lg:col-span-5 lg:col-start-8 lg:self-end">
            <Reveal delay={0.16}>
              <ul className="space-y-4">
                {channels.map(({ Icon, label, value, href }) => (
                  <li key={label}>
                    {href ? (
                      <a href={href} className="group inline-flex items-center gap-3 text-[14.5px] text-paper-200 transition-colors hover:text-paper-50">
                        <span className="grid h-9 w-9 place-items-center rounded-xl border border-[var(--edge-strong)] bg-iris-500/10 text-iris-300 transition-colors group-hover:bg-iris-500/22">
                          <Icon size={15} strokeWidth={1.8} />
                        </span>
                        {value}
                      </a>
                    ) : (
                      <span className="inline-flex items-center gap-3 text-[14.5px] text-paper-200">
                        <span className="grid h-9 w-9 place-items-center rounded-xl border border-[var(--edge-strong)] bg-iris-500/10 text-iris-300">
                          <Icon size={15} strokeWidth={1.8} />
                        </span>
                        {value}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={0.2}>
              <ResumeActions className="mt-8" />
            </Reveal>

            <Reveal delay={0.22}>
              <ul className="mt-8 flex items-center gap-3">
                {[
                  { href: profile.github, Icon: GithubIcon, label: 'GitHub' },
                  { href: profile.linkedin, Icon: LinkedinIcon, label: 'LinkedIn' },
                ].map(({ href, Icon, label }) => (
                  <li key={label}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noreferrer noopener"
                      aria-label={label}
                      className="grid h-10 w-10 place-items-center rounded-xl border border-[var(--edge-strong)] text-paper-400 transition-all duration-300 hover:-translate-y-0.5 hover:border-iris-400 hover:bg-iris-500/15 hover:text-paper-50"
                    >
                      <Icon size={16} />
                    </a>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}

export function Footer() {
  return (
    <footer className="border-t border-[var(--edge)] py-9">
      <div className="shell">
        <div className="flex flex-col gap-7 md:flex-row md:items-start md:justify-between">
          <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2">
            {navItems
              .filter((n) => n.id !== 'home')
              .map((item) => (
                <a key={item.id} href={`#${item.id}`} className="text-[13px] text-paper-400 transition-colors duration-300 hover:text-paper-50">
                  {item.label}
                </a>
              ))}
          </nav>

          <div className="flex flex-col gap-2 md:items-end">
            <div className="flex gap-4">
              <a href={profile.linkedin} target="_blank" rel="noreferrer noopener" className="font-mono text-[11px] tracking-[0.14em] text-paper-600 transition-colors hover:text-paper-50">LINKEDIN</a>
              <a href={profile.github} target="_blank" rel="noreferrer noopener" className="font-mono text-[11px] tracking-[0.14em] text-paper-600 transition-colors hover:text-paper-50">GITHUB</a>
              <a href={`mailto:${profile.email}`} className="font-mono text-[11px] tracking-[0.14em] text-paper-600 transition-colors hover:text-paper-50">EMAIL</a>
            </div>
            <p className="font-mono text-[11px] tracking-[0.14em] text-paper-800">© 2026 GOPI PATEL</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
