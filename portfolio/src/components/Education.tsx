import { education } from "../data/resume";
import { Section } from "./Section";

export function Education() {
  return (
    <Section id="education" index={5} command="cat ~/education" title="Education">
      <ul className="grid gap-px overflow-hidden rounded-md border border-line bg-line md:grid-cols-2">
        {education.map((e) => (
          <li key={e.school} className="bg-void p-6 sm:p-8">
            <p className="font-mono text-xs text-faint">{e.period}</p>
            <h3 className="mt-2 text-lg font-semibold leading-snug text-fg">{e.degree}</h3>
            <p className="mt-2 text-dim">{e.school}</p>
            <p className="mt-5 font-mono text-2xl text-phos">{e.score}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}
