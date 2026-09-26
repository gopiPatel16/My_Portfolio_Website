import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { toolkit } from '../../data/ai'
import { skillGroups } from '../../data/skills'
import { ContourField } from '../ContourField'
import { Reveal, SectionHeader } from '../primitives'

/** Every tool in the section, travelling the arcs behind it. */
const toolNames = toolkit.flatMap((g) => g.tools.map((t) => t.name))

/** The AI tools lead the tab row; the technique groups follow. */
const TOOLS = 'tools'
const tabs = [{ id: TOOLS, label: 'AI tools' }, ...skillGroups.map(({ id, label }) => ({ id, label }))]

const chip =
  'inline-block rounded-lg border border-[var(--edge)] bg-ink-950/70 px-3.5 py-2 text-[13px] text-paper-200 transition-all duration-300 hover:-translate-y-0.5 hover:border-iris-400/60 hover:bg-iris-500/10 hover:text-paper-50'

/* ------------------------------------------------------------------ *
 * AI toolkit & techniques — tools and technical skills in one tab set.
 * ------------------------------------------------------------------ */

export function Toolkit() {
  const [active, setActive] = useState(TOOLS)
  const group = skillGroups.find((g) => g.id === active)

  return (
    <section id="toolkit" className="relative scroll-mt-24 overflow-hidden py-20 md:py-28">
      {/* Contour rings sweeping out of the bottom-right corner. The pattern is
          positioned and the content below it is not, so a `relative` on the
          shell is all that keeps the two in the right order. */}
      <ContourField
        className="pointer-events-none absolute inset-0 h-full w-full"
        opacity={0.62}
        labels={toolNames}
      />

      <div className="shell relative">
        <SectionHeader
          index="03"
          label="AI toolkit & techniques"
          title={<>The models, tools and techniques I actually reach for</>}
          lede="AI tools grouped by what I use them for, then the techniques and technologies behind every project. Claude Code is the one I build in daily. No proficiency percentages: none were measured, and each item appears in at least one project here."
        />

        <Reveal>
          <div
            role="tablist"
            aria-label="Tools and techniques"
            className="no-scrollbar -mx-[var(--gutter)] flex gap-1.5 overflow-x-auto px-[var(--gutter)] pb-1"
          >
            {tabs.map((t) => {
              const on = t.id === active
              return (
                <button
                  key={t.id}
                  role="tab"
                  type="button"
                  aria-selected={on}
                  onClick={() => setActive(t.id)}
                  className={`shrink-0 rounded-full border px-4 py-2 text-[13px] transition-colors duration-300 ${
                    on
                      ? 'border-iris-500/50 bg-iris-500/12 text-paper-50'
                      : 'border-[var(--edge)] bg-ink-950/85 text-paper-200 hover:text-paper-50'
                  }`}
                >
                  {t.id === TOOLS && <Sparkles size={12} strokeWidth={1.9} className="mr-1.5 inline text-iris-300" />}
                  {t.label}
                </button>
              )
            })}
          </div>
        </Reveal>

        <Reveal delay={0.05}>
          <div key={active} className="mt-7">
            {group ? (
              <ul className="flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <li key={item}>
                    <span className={chip}>{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="grid gap-x-10 gap-y-8 md:grid-cols-2 lg:grid-cols-3">
                {toolkit.map((g) => (
                  <div key={g.group}>
                    {/* Backed, because the contour lines run straight behind these small labels. */}
                    <p className="label inline-block rounded-md bg-ink-950/85 px-2 py-1 text-paper-200">{g.group}</p>
                    <ul className="mt-3 flex flex-wrap gap-2">
                      {g.tools.map((tool) => (
                        <li key={tool.name}>
                          {'primary' in tool && tool.primary ? (
                            <span className="inline-flex items-center gap-2 rounded-lg border border-iris-500/50 bg-linear-to-r from-azure-500/25 to-iris-500/25 px-3.5 py-2 text-[13px] font-medium text-paper-50">
                              <Sparkles size={13} strokeWidth={1.9} className="text-iris-300" />
                              {tool.name}
                            </span>
                          ) : (
                            <span className={chip}>{tool.name}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                    {g.tools.some((t) => 'note' in t && t.note) && (
                      <p className="mt-2.5 inline-block rounded-md bg-ink-950/85 px-2 py-1 font-mono text-[10px] tracking-[0.12em] text-iris-300">
                        {g.tools.find((t) => 'note' in t && t.note)?.note?.toUpperCase()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
