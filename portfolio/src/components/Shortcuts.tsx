import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { sections } from "../data/resume";
import { scrollToSection } from "../hooks/useActiveSection";
import { emit, on } from "../lib/bus";
import { cycleAccent } from "../lib/theme";
import { setSound, soundOn } from "../lib/sound";

const ROWS: [string, string][] = [
  ["ctrl/⌘ + k", "open the command palette"],
  ["/", "focus the terminal"],
  [`0 - ${sections.length - 1}`, "jump to a section, like tmux windows"],
  ["j / k", "next / previous section"],
  ["t", "cycle the accent color"],
  ["m", "key sounds on / off"],
  ["?", "show this list"],
  ["esc", "close"],
];

function typing(t: EventTarget | null) {
  const el = t as HTMLElement | null;
  return !!el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);
}

// Global keyboard shortcuts + the help overlay.
export function Shortcuts({ active }: { active: string }) {
  const [open, setOpen] = useState(false);
  useEffect(() => on("open-shortcuts", () => setOpen(true)), []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(false);
        emit("open-palette");
        return;
      }
      if (e.key === "Escape") setOpen(false);
      if (typing(e.target) || e.metaKey || e.ctrlKey || e.altKey) return;
      if (document.querySelector('[aria-modal="true"]')) return;
      const ids = sections.map((s) => s.id) as string[];
      if (/^[0-9]$/.test(e.key) && Number(e.key) < ids.length) scrollToSection(ids[Number(e.key)]);
      else if (e.key === "j" || e.key === "k") {
        const cur = Math.max(0, ids.indexOf(active));
        const next = e.key === "j" ? Math.min(ids.length - 1, cur + 1) : Math.max(0, cur - 1);
        scrollToSection(ids[next]);
      } else if (e.key === "/") {
        e.preventDefault();
        scrollToSection("home");
        setTimeout(() => document.getElementById("term-input")?.focus({ preventScroll: true }), 250);
      } else if (e.key === "?") setOpen((o) => !o);
      else if (e.key === "t") cycleAccent();
      else if (e.key === "m") setSound(!soundOn());
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] grid place-items-center bg-black/70 px-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="sc-title"
            initial={{ scale: 0.97, y: 6 }}
            animate={{ scale: 1, y: 0 }}
            className="w-full max-w-md rounded-md border border-line bg-panel p-6 font-mono text-sm"
          >
            <h2 id="sc-title" className="text-fg">Keyboard shortcuts</h2>
            <dl className="mt-4 grid grid-cols-[8rem_1fr] gap-y-2">
              {ROWS.map(([k, d]) => (
                <div key={k} className="contents">
                  <dt><kbd className="rounded border border-line px-1.5 py-0.5 text-xs text-phos">{k}</kbd></dt>
                  <dd className="text-dim">{d}</dd>
                </div>
              ))}
            </dl>
            <button type="button" autoFocus onClick={() => setOpen(false)} className="mt-6 rounded border border-line px-3 py-1.5 text-xs text-dim hover:border-phos-dim hover:text-phos">
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
