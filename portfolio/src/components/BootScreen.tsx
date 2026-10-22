import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { on } from "../lib/bus";
import { certifications, experience, profile, projects } from "../data/resume";

// BIOS-style boot on the first visit only (or via `reboot`). Any key or click skips it.
const KEY = "sujal-booted";
const LINES = [
  `SM-BIOS v1.0  ${profile.name}`,
  "memory check ................ ok",
  `loading ${projects.length} projects ............ ok`,
  `mounting ${certifications.length} certificates ......... ok`,
  `last job: ${experience[0].role}, ${experience[0].company}`,
  "starting workspace ...",
];

export function BootScreen() {
  const [show, setShow] = useState(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
    try { return !localStorage.getItem(KEY); } catch { return false; }
  });
  const [n, setN] = useState(0);

  useEffect(() => on("reboot", () => { setN(0); setShow(true); }), []);

  useEffect(() => {
    if (!show) return;
    try { localStorage.setItem(KEY, "1"); } catch { /* ignore */ }
    const timers = LINES.map((_, i) => setTimeout(() => setN(i + 1), 180 + i * 260));
    const end = setTimeout(() => setShow(false), 180 + LINES.length * 260 + 500);
    const skip = () => setShow(false);
    addEventListener("keydown", skip);
    addEventListener("pointerdown", skip);
    return () => { timers.forEach(clearTimeout); clearTimeout(end); removeEventListener("keydown", skip); removeEventListener("pointerdown", skip); };
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[90] flex flex-col justify-between bg-void p-6 font-mono text-sm sm:p-12"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.4 } }}
          role="status"
          aria-label="Loading"
        >
          <div className="space-y-1.5">
            {LINES.slice(0, n).map((l, i) => (
              <p key={i} className={i === 0 ? "text-phos" : "text-dim"}>{l}</p>
            ))}
            {n < LINES.length && <span className="cursor-block" aria-hidden="true" />}
          </div>
          <p className="text-faint">press any key to skip</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
