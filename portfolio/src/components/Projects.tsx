import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { projects } from "../data/resume";
import { Section } from "./Section";
import { on, selectSkill } from "../lib/bus";
import { architecture } from "../data/architecture";
import { ArchDiagram } from "./ArchDiagram";
import { DemoStatus } from "./DemoStatus";
import { GitHubPanel } from "./GitHubPanel";

export function Projects() {
  const [open, setOpen] = useState<string | null>(projects[0].slug);
  const [tab, setTab] = useState<Record<string, "overview" | "arch">>({});
  useEffect(() => on("open-project", (slug) => setOpen(slug)), []);
  return (
    <Section id="projects" index={2} command="ls ~/projects" title="Projects">
      <ul className="divide-y divide-line border-y border-line">
        {projects.map((p) => {
          const isOpen = open === p.slug;
          return (
            <li key={p.slug} id={`proj-${p.slug}`} className="scroll-mt-16">
              <h3>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={`p-${p.slug}`}
                  onClick={() => setOpen(isOpen ? null : p.slug)}
                  className="group grid w-full grid-cols-[1fr_auto] items-baseline gap-4 py-6 text-left"
                >
                  <span>
                    <span className="block font-mono text-xs text-faint">~/projects/{p.slug}</span>
                    <span className={`mt-1 block text-xl font-semibold transition-colors sm:text-2xl ${isOpen ? "text-phos" : "text-fg group-hover:text-phos"}`}>{p.name}</span>
                    <span className="mt-2 block max-w-[70ch] text-dim">{p.summary}</span>
                  </span>
                  <span aria-hidden="true" className="font-mono text-lg text-dim group-hover:text-phos">{isOpen ? "[-]" : "[+]"}</span>
                </button>
              </h3>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    id={`p-${p.slug}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="overflow-hidden"
                  >
                    <div className="mb-5 flex gap-1 font-mono text-xs" role="tablist" aria-label={`${p.name} views`}>
                      {(["overview", "arch"] as const).map((t) => {
                        const cur = (tab[p.slug] ?? "overview") === t;
                        return (
                          <button
                            key={t}
                            type="button"
                            role="tab"
                            aria-selected={cur}
                            onClick={() => setTab((x) => ({ ...x, [p.slug]: t }))}
                            className={`rounded px-3 py-1.5 ${cur ? "bg-panel-2 text-phos" : "text-dim hover:text-fg"}`}
                          >
                            {t === "overview" ? "overview" : "architecture"}
                          </button>
                        );
                      })}
                    </div>
                    {(tab[p.slug] ?? "overview") === "arch" ? (
                      <div className="pb-8" role="tabpanel"><ArchDiagram d={architecture[p.slug]} title={p.name} /></div>
                    ) : (
                    <div className="grid gap-8 pb-8 md:grid-cols-[1.1fr_1fr]">
                      <ul className="space-y-2 font-mono text-sm">
                        {p.details.map((d) => (
                          <li key={d} className="flex gap-3 text-fg"><span className="text-phos" aria-hidden="true">&gt;</span>{d}</li>
                        ))}
                      </ul>
                      <div>
                        <p className="font-mono text-xs text-faint">stack <span className="text-faint/70">(click a tool to find it in skills)</span></p>
                        <ul className="mt-2 flex flex-wrap gap-1.5" aria-label={`${p.name} tech stack`}>
                          {p.stack.map((s) => (
                            <li key={s}>
                              <button
                                type="button"
                                onClick={() => selectSkill(s)}
                                title={`Find ${s} in skills`}
                                className="rounded-sm border border-line bg-panel px-2 py-0.5 font-mono text-xs text-dim transition-colors hover:border-phos-dim hover:text-phos"
                              >
                                {s}
                              </button>
                            </li>
                          ))}
                        </ul>
                        <div className="mt-5 flex flex-wrap gap-3 font-mono text-sm">
                          {p.repo && <a href={p.repo} target="_blank" rel="noreferrer" className="rounded border border-line px-3 py-1.5 hover:border-phos hover:text-phos">GitHub repo</a>}
                          {p.demo && <a href={p.demo} target="_blank" rel="noreferrer" className="rounded border border-phos-dim px-3 py-1.5 text-phos hover:bg-phos hover:text-black">Live demo</a>}
                        </div>
                        {p.demo && <div className="mt-4"><DemoStatus url={p.demo} /></div>}
                      </div>
                    </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>

      <GitHubPanel />
    </Section>
  );
}
