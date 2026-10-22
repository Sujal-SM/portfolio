import { experience } from "../data/resume";
import { Section } from "./Section";
import { DurationBar, HoloCert } from "./HoloCert";

export function Experience() {
  return (
    <Section id="experience" index={4} command="git log --career" title="Experience">
      <div className="grid gap-12 lg:grid-cols-[1.05fr_1fr] lg:items-start">
      <ol className="relative border-l border-line pl-8">
        {experience.map((e) => (
          <li key={e.company} className="relative">
            <span aria-hidden="true" className="absolute -left-[37px] top-1.5 size-2.5 rounded-full bg-phos shadow-[0_0_12px_rgba(var(--phos-rgb),0.27)]" />
            <p className="font-mono text-sm text-phos">{e.period}</p>
            <h3 className="mt-1 text-2xl font-semibold text-fg">
              {e.role},{" "}
              <a href={e.companyUrl} target="_blank" rel="noreferrer" className="underline decoration-line underline-offset-4 hover:text-phos hover:decoration-phos">{e.company}</a>
            </h3>
            <p className="mt-1 font-mono text-xs text-faint">{e.companyType}</p>
            <p className="mt-3 max-w-[70ch] text-dim">{e.summary}</p>
            <ul className="mt-5 max-w-[75ch] space-y-3">
              {e.points.map((pt) => (
                <li key={pt} className="grid grid-cols-[auto_1fr] gap-3 leading-relaxed text-fg">
                  <span className="font-mono text-phos" aria-hidden="true">+</span>{pt}
                </li>
              ))}
            </ul>
            <ul className="mt-6 flex flex-wrap gap-1.5" aria-label="Technologies used">
              {e.tags.map((t) => <li key={t} className="rounded-sm border border-line px-2 py-0.5 font-mono text-xs text-dim">{t}</li>)}
            </ul>
          </li>
        ))}
      </ol>
      <div className="lg:sticky lg:top-20">
        <p className="mb-3 flex items-center gap-2 font-mono text-xs text-dim">
          <span className="grid size-4 place-items-center rounded-full bg-phos text-[10px] font-bold text-black" aria-hidden="true">✓</span>
          completion certificate on file
        </p>
        <HoloCert />
        <div className="mt-6"><DurationBar /></div>
      </div>
      </div>
    </Section>
  );
}
