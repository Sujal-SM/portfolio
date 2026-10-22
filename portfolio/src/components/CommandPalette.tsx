import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { certifications, internshipCertificate, profile, projects, RESUME_URL, sections } from "../data/resume";
import { scrollToSection } from "../hooks/useActiveSection";
import { on, openProject, viewDoc, emit } from "../lib/bus";
import { ACCENTS, setAccent } from "../lib/theme";

type Item = { id: string; group: string; label: string; hint?: string; run: () => void };

const ext = (url: string) => () => window.open(url, "_blank", "noopener");

function buildItems(): Item[] {
  const items: Item[] = [
    ...sections.map((s, i) => ({ id: `go-${s.id}`, group: "Go to", label: s.label, hint: String(i), run: () => scrollToSection(s.id) })),
    ...projects.map((p) => ({ id: `p-${p.slug}`, group: "Projects", label: p.name, hint: "open", run: () => openProject(p.slug) })),
    ...projects.flatMap((p) => [
      ...(p.repo ? [{ id: `r-${p.slug}`, group: "Links", label: `${p.name} repo`, hint: "github", run: ext(p.repo) }] : []),
      ...(p.demo ? [{ id: `d-${p.slug}`, group: "Links", label: `${p.name} live demo`, hint: "web", run: ext(p.demo) }] : []),
    ]),
    { id: "gh", group: "Links", label: "GitHub profile", hint: profile.github.label, run: ext(profile.github.url) },
    { id: "li", group: "Links", label: "LinkedIn", hint: profile.linkedin.label, run: ext(profile.linkedin.url) },
    ...certifications.map((c) => ({ id: `c-${c.name}`, group: "Certificates", label: c.name, hint: c.issuer, run: () => viewDoc(c.name, c.url) })),
    { id: "c-intern", group: "Certificates", label: "Internship certificate, Global Trend", hint: "pdf", run: () => viewDoc(`${internshipCertificate.title}: ${internshipCertificate.company}`, internshipCertificate.pdf, internshipCertificate.image) },
    { id: "g-snake", group: "Play", label: "Play snake", hint: "snake", run: () => emit("open-game", "snake") },
    { id: "g-type", group: "Play", label: "kubectl typing test", hint: "typetest", run: () => emit("open-game", "type") },
    {
      id: "copy",
      group: "Actions",
      label: "Copy email address",
      hint: profile.email,
      run: () => { void navigator.clipboard?.writeText(profile.email).catch(() => undefined); },
    },
    { id: "mail", group: "Actions", label: "Write an email", run: () => { window.location.href = `mailto:${profile.email}`; } },
    {
      id: "term",
      group: "Actions",
      label: "Focus the terminal",
      hint: "/",
      run: () => {
        scrollToSection("home");
        setTimeout(() => document.getElementById("term-input")?.focus({ preventScroll: true }), 300);
      },
    },
  ];
  for (const a of ACCENTS) items.push({ id: `t-${a}`, group: "Theme", label: `Accent: ${a}`, run: () => setAccent(a) });
  items.push({ id: "shower", group: "Actions", label: "Meteor shower", hint: "stars", run: () => window.dispatchEvent(new Event("meteor-shower")) });
  if (RESUME_URL) items.push({ id: "cv", group: "Actions", label: "Open resume (PDF)", run: ext(RESUME_URL) });
  return items;
}

function score(label: string, q: string) {
  if (!q) return 1;
  const l = label.toLowerCase();
  const s = q.toLowerCase();
  if (l.includes(s)) return 2 + (l.startsWith(s) ? 1 : 0);
  // loose subsequence match: "rsa" finds "retail store app"
  let i = 0;
  for (const ch of l) if (ch === s[i]) i++;
  return i === s.length ? 1 : 0;
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);
  const all = useMemo(buildItems, []);

  const results = useMemo(
    () => {
      const scored = all.map((it) => ({ it, s: score(`${it.label} ${it.group}`, q) })).filter((x) => x.s > 0);
      // fall back to loose matches only when nothing contains the query
      const strong = scored.filter((x) => x.s > 1);
      return (q && strong.length ? strong : scored).sort((a, b) => b.s - a.s).map((x) => x.it);
    },
    [all, q],
  );

  useEffect(() => on("open-palette", () => setOpen(true)), []);
  useEffect(() => {
    if (open) {
      lastFocus.current = document.activeElement as HTMLElement;
      setQ("");
      setSel(0);
      setTimeout(() => inputRef.current?.focus(), 10);
    } else lastFocus.current?.focus?.({ preventScroll: true });
  }, [open]);
  useEffect(() => setSel(0), [q]);
  useEffect(() => {
    listRef.current?.querySelector(`[data-i="${sel}"]`)?.scrollIntoView({ block: "nearest" });
  }, [sel]);

  function run(it: Item) {
    setOpen(false);
    setTimeout(it.run, 60);
  }

  let lastGroup = "";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-start justify-center bg-black/70 px-4 pt-[12vh] backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            initial={{ y: -10, scale: 0.98 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: -6, opacity: 0 }}
            transition={{ duration: 0.16 }}
            className="w-full max-w-xl overflow-hidden rounded-md border border-line bg-panel shadow-2xl"
            onKeyDown={(e) => {
              if (e.key === "Escape") setOpen(false);
              else if (e.key === "ArrowDown") { e.preventDefault(); setSel((s) => Math.min(results.length - 1, s + 1)); }
              else if (e.key === "ArrowUp") { e.preventDefault(); setSel((s) => Math.max(0, s - 1)); }
              else if (e.key === "Enter" && results[sel]) { e.preventDefault(); run(results[sel]); }
              else if (e.key === "Tab") e.preventDefault(); // keep focus in the dialog
            }}
          >
            <div className="flex items-center gap-2 border-b border-line px-4">
              <span className="font-mono text-phos" aria-hidden="true">&gt;</span>
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Jump to a section, project or link..."
                aria-label="Search commands"
                aria-controls="palette-list"
                aria-activedescendant={results[sel] ? `pal-${results[sel].id}` : undefined}
                className="h-12 flex-1 bg-transparent font-mono text-sm text-fg outline-none placeholder:text-faint"
              />
              <kbd className="rounded border border-line px-1.5 font-mono text-[10px] text-faint">esc</kbd>
            </div>
            <ul id="palette-list" ref={listRef} role="listbox" className="term-scroll max-h-[50vh] overflow-y-auto py-2">
              {results.length === 0 && <li className="px-4 py-6 text-center font-mono text-sm text-dim">Nothing matches "{q}". Try a project, skill section or "email".</li>}
              {results.map((it, i) => {
                const header = it.group !== lastGroup && !q;
                lastGroup = it.group;
                return (
                  <li key={it.id} role="presentation">
                    {header && <p className="px-4 pb-1 pt-3 font-mono text-[11px] text-faint">{it.group}</p>}
                    <div
                      id={`pal-${it.id}`}
                      role="option"
                      aria-selected={i === sel}
                      data-i={i}
                      onMouseMove={() => setSel(i)}
                      onClick={() => run(it)}
                      className={`mx-2 flex cursor-pointer items-center justify-between gap-4 rounded px-3 py-2 text-sm ${i === sel ? "bg-panel-2 text-phos" : "text-fg"}`}
                    >
                      <span className="truncate">{it.label}</span>
                      {it.hint && <span className="shrink-0 truncate font-mono text-xs text-faint">{it.hint}</span>}
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className="flex gap-4 border-t border-line px-4 py-2 font-mono text-[11px] text-faint">
              <span>↑↓ move</span><span>enter run</span><span>? shortcuts</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
