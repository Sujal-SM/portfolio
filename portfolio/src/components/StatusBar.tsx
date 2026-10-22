import { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { emit } from "../lib/bus";
import { profile, sections } from "../data/resume";
import { scrollToSection } from "../hooks/useActiveSection";

function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);
  return now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Kolkata" });
}

// tmux-style status bar: each section is a "window"
export function StatusBar({ active }: { active: string }) {
  const time = useClock();
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 200, damping: 30, restDelta: 0.001 });
  return (
    <header className="sticky top-[env(safe-area-inset-top,0px)] z-50 border-b border-line bg-void/90 backdrop-blur">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:bg-phos focus:px-3 focus:py-1 focus:text-black">
        Skip to content
      </a>
      <nav aria-label="Sections" className="mx-auto flex h-12 max-w-6xl items-center gap-4 px-5 font-mono text-xs sm:px-8 sm:text-[13px]">
        <a href="#home" onClick={(e) => { e.preventDefault(); scrollToSection("home"); }} className="shrink-0 bg-phos px-2 py-0.5 font-semibold text-black">
          {profile.handle}
        </a>
        <ul className="term-scroll flex flex-1 gap-1 overflow-x-auto">
          {sections.map((s, i) => {
            const isActive = active === s.id;
            return (
              <li key={s.id} className="relative shrink-0">
                <a
                  href={`#${s.id}`}
                  aria-current={isActive ? "location" : undefined}
                  onClick={(e) => { e.preventDefault(); scrollToSection(s.id); history.replaceState(null, "", `#${s.id}`); }}
                  className={`relative block px-2 py-1 transition-colors ${isActive ? "text-phos" : "text-dim hover:text-fg"}`}
                >
                  {isActive && (
                    <motion.span layoutId="win" className="absolute inset-0 -z-10 rounded-sm bg-panel-2" transition={{ type: "spring", stiffness: 500, damping: 40 }} />
                  )}
                  {i}:{s.label}{isActive ? "*" : ""}
                </a>
              </li>
            );
          })}
        </ul>
        <span className="hidden shrink-0 text-faint lg:inline">New Delhi {time} IST</span>
        <button
          type="button"
          onClick={() => emit("open-palette")}
          className="shrink-0 rounded border border-line px-2 py-1 text-dim transition-colors hover:border-phos-dim hover:text-phos"
          aria-label="Open command palette"
        >
          <span className="hidden sm:inline">ctrl k</span>
          <span className="sm:hidden" aria-hidden="true">⌘</span>
        </button>
      </nav>
      <motion.div aria-hidden="true" className="absolute bottom-[-1px] left-0 right-0 h-px origin-left bg-phos" style={{ scaleX: progress }} />
    </header>
  );
}
