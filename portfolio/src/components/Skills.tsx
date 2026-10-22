import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { skills } from "../data/resume";
import { whereUsed } from "../lib/usage";
import { on, openProject } from "../lib/bus";
import { Section } from "./Section";
import { Keycap } from "./Keycap";

// quick keys for the core tools (each maps to an exact skill on the resume)
const KEYS = [
  { legend: "tf", sub: "iac", skill: "Terraform" },
  { legend: "k8s", sub: "orch", skill: "Kubernetes (K8s)" },
  { legend: "dkr", sub: "ctr", skill: "Docker" },
  { legend: "aws", sub: "cloud", skill: "AWS (EKS, EC2, S3, IAM, VPC, ELB)" },
  { legend: "oci", sub: "cloud", skill: "Oracle Cloud Infrastructure (OCI)" },
  { legend: "argo", sub: "cd", skill: "ArgoCD" },
  { legend: "py", sub: "lang", skill: "Python" },
  { legend: "rhel", sub: "os", skill: "Linux (RHEL)" },
];

const matches = (item: string, q: string) => {
  const toks = q.toLowerCase().split(/\s+/).filter(Boolean);
  const s = item.toLowerCase();
  return toks.every((t) => s.includes(t));
};

// `tree` output you can grep and click
export function Skills() {
  const [q, setQ] = useState("");
  const [picked, setPicked] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(
    () =>
      on("select-skill", (s) => {
        setQ(s);
        const exact = skills.flatMap((g) => g.items).find((i) => matches(i, s));
        setPicked(exact ?? s);
      }),
    [],
  );

  const total = useMemo(() => skills.reduce((n, g) => n + g.items.length, 0), []);
  const shown = useMemo(() => skills.reduce((n, g) => n + g.items.filter((i) => !q || matches(i, q)).length, 0), [q]);
  const focus = picked ?? (q && shown === 0 ? q : null);
  const used = focus ? whereUsed(focus) : [];

  return (
    <Section id="skills" index={3} command="tree ~/skills" title="Skills">
      <div className="mb-8 flex flex-wrap gap-3 pb-1" role="group" aria-label="Core tools">
        {KEYS.map((k) => (
          <Keycap
            key={k.legend}
            legend={k.legend}
            sub={k.sub}
            size="lg"
            label={`Show where ${k.skill} is used`}
            active={picked === k.skill}
            onPress={() => {
              const turnOn = picked !== k.skill;
              setPicked(turnOn ? k.skill : null);
              setQ("");
            }}
          />
        ))}
      </div>

      <div className="mb-10 flex flex-wrap items-center gap-3 font-mono text-sm">
        <label htmlFor="skill-grep" className="text-dim">
          <span className="text-phos">$</span> grep -i
        </label>
        <input
          id="skill-grep"
          ref={inputRef}
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPicked(null);
          }}
          placeholder="docker, aws, terraform..."
          autoComplete="off"
          spellCheck={false}
          className="w-56 rounded border border-line bg-panel px-3 py-1.5 text-fg placeholder:text-faint focus:border-phos-dim"
        />
        <span className="text-faint" aria-live="polite">{shown}/{total} match</span>
        {(q || picked) && (
          <button type="button" onClick={() => { setQ(""); setPicked(null); inputRef.current?.focus(); }} className="text-dim underline underline-offset-4 hover:text-phos">
            reset
          </button>
        )}
      </div>

      <div className="grid gap-10 lg:grid-cols-[1fr_20rem]">
        <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2 xl:grid-cols-3">
          {skills.map((s) => (
            <div key={s.group} className="font-mono text-sm">
              <h3 className="font-medium text-phos">{s.group}/</h3>
              <ul className="mt-1.5">
                {s.items.map((item, i) => {
                  const hit = !q || matches(item, q);
                  const sel = picked === item;
                  return (
                    <li key={item} className="flex items-start">
                      <span className="shrink-0 whitespace-pre text-faint" aria-hidden="true">{i === s.items.length - 1 ? "└── " : "├── "}</span>
                      <button
                        type="button"
                        onClick={() => setPicked(sel ? null : item)}
                        aria-pressed={sel}
                        className={`rounded-sm px-1 text-left transition-colors ${
                          sel ? "bg-phos text-black" : hit ? "text-fg hover:bg-panel-2 hover:text-phos" : "text-faint/50"
                        }`}
                      >
                        {item}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        <aside aria-live="polite" className="h-fit rounded-md border border-line bg-panel p-5 font-mono text-sm lg:sticky lg:top-20">
          <AnimatePresence mode="wait">
            {focus ? (
              <motion.div key={focus} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
                <p className="text-faint">$ where-used "{focus}"</p>
                {used.length ? (
                  <ul className="mt-3 space-y-2">
                    {used.map((u) => (
                      <li key={u.label}>
                        {u.slug ? (
                          <button type="button" onClick={() => openProject(u.slug!)} className="text-left text-phos underline decoration-phos-dim underline-offset-4 hover:decoration-phos">
                            {u.label}
                          </button>
                        ) : (
                          <span className="text-fg">{u.label}</span>
                        )}
                        <span className="ml-2 text-faint">{u.kind}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-dim">Listed in the toolbox. Not named in a specific project or role on the resume.</p>
                )}
              </motion.div>
            ) : (
              <motion.p key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-dim">
                Click any skill to see which projects and roles use it.
              </motion.p>
            )}
          </AnimatePresence>
        </aside>
      </div>
    </Section>
  );
}
