import { motion, useMotionTemplate, useMotionValue, useReducedMotion } from "framer-motion";
import { emit } from "../lib/bus";
import { profile, RESUME_URL } from "../data/resume";
import { scrollToSection } from "../hooks/useActiveSection";
import { Terminal } from "./Terminal";
import { Mascot } from "./Mascot";
import { Keycap } from "./Keycap";

const isSlash = (e: KeyboardEvent) => e.key === "/";
const isCtrl = (e: KeyboardEvent) => e.key === "Control" || e.key === "Meta";
const isK = (e: KeyboardEvent) => e.key.toLowerCase() === "k" && (e.ctrlKey || e.metaKey);
const isHelp = (e: KeyboardEvent) => e.key === "?";

function focusTerminal() {
  document.getElementById("term-input")?.focus({ preventScroll: true });
}

export function Hero() {
  const reduce = useReducedMotion();
  const mx = useMotionValue(-1000);
  const my = useMotionValue(-1000);
  const spot = useMotionTemplate`radial-gradient(420px circle at ${mx}px ${my}px, rgba(var(--phos-rgb),0.09), transparent 70%)`;
  const rise = (delay: number) => (reduce ? {} : { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { delay, duration: 0.5, ease: [0.2, 0.7, 0.2, 1] } });

  return (
    <section
      id="home"
      aria-labelledby="home-title"
      className="desk relative"
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return;
        const r = e.currentTarget.getBoundingClientRect();
        mx.set(e.clientX - r.left);
        my.set(e.clientY - r.top);
      }}
      onPointerLeave={() => { mx.set(-1000); my.set(-1000); }}
    >
      <motion.div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: spot }} />
      <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-5 pb-20 pt-16 sm:px-8 sm:pt-24 lg:grid-cols-[1fr_1.05fr] lg:gap-14 lg:pb-28">
        <div className="min-w-0">
          <motion.p {...rise(0)} className="font-mono text-sm text-dim">
            <span className="text-phos">~</span>$ whoami
          </motion.p>
          <motion.h1 {...rise(0.08)} id="home-title" tabIndex={-1} className="glow mt-4 font-mono text-5xl font-semibold leading-[0.95] tracking-tight text-phos focus:outline-none sm:text-7xl">
            Sujal
            <br />
            Malhotra<span className="cursor-block ml-2" aria-hidden="true" />
          </motion.h1>
          <motion.p {...rise(0.18)} className="mt-6 text-xl font-medium text-fg sm:text-2xl">
            {profile.headline}
          </motion.p>
          <motion.p {...rise(0.26)} className="mt-4 max-w-[52ch] text-base leading-relaxed text-dim">
            {profile.intro}
          </motion.p>
          <motion.div {...rise(0.34)} className="mt-8 flex flex-wrap gap-3">
            <a
              href="#projects"
              onClick={(e) => { e.preventDefault(); scrollToSection("projects"); }}
              className="rounded bg-phos px-5 py-2.5 font-mono text-sm font-semibold text-black transition hover:brightness-110"
            >
              View projects
            </a>
            <a href={profile.github.url} target="_blank" rel="noreferrer" className="rounded border border-line px-5 py-2.5 font-mono text-sm text-fg transition hover:border-phos hover:text-phos">
              GitHub
            </a>
            {RESUME_URL && (
              <a href={RESUME_URL} target="_blank" rel="noreferrer" className="rounded border border-line px-5 py-2.5 font-mono text-sm text-fg transition hover:border-phos hover:text-phos">
                Resume (PDF)
              </a>
            )}
          </motion.div>
          <motion.dl {...rise(0.42)} className="mt-10 grid max-w-md grid-cols-[6rem_1fr] gap-y-2 font-mono text-xs">
            <dt className="text-faint">focus</dt><dd className="text-dim">OCI, AWS, Kubernetes, GitOps</dd>
            <dt className="text-faint">recent</dt><dd className="text-dim">OCI Intern, Global Trend</dd>
            <dt className="text-faint">certified</dt><dd className="text-dim">OCI DevOps Professional</dd>
          </motion.dl>
          <motion.div {...rise(0.5)} className="mt-10">
            <p className="mb-3 font-mono text-xs text-faint">try the keys (click or press them)</p>
            <div className="flex flex-wrap items-end gap-x-5 gap-y-4">
              <div className="flex items-center gap-2">
                <Keycap legend="/" sub="term" label="Focus the terminal" match={isSlash} onPress={focusTerminal} />
                <span className="font-mono text-xs text-dim">terminal</span>
              </div>
              <div className="flex items-center gap-2">
                <Keycap legend="ctrl" label="Control" match={isCtrl} />
                <span className="font-mono text-xs text-faint" aria-hidden="true">+</span>
                <Keycap legend="K" sub="go" label="Open the command palette" match={isK} onPress={() => emit("open-palette")} />
                <span className="font-mono text-xs text-dim">jump</span>
              </div>
              <div className="flex items-center gap-2">
                <Keycap legend="?" sub="help" label="Show keyboard shortcuts" match={isHelp} onPress={() => emit("open-shortcuts")} />
                <span className="font-mono text-xs text-dim">shortcuts</span>
              </div>
            </div>
          </motion.div>
        </div>
        <motion.div className="relative mt-16 min-w-0 lg:mt-0" {...(reduce ? {} : { initial: { opacity: 0, scale: 0.98 }, animate: { opacity: 1, scale: 1 }, transition: { delay: 0.2, duration: 0.5 } })}>
          <Mascot />
          <Terminal />
        </motion.div>
      </div>
    </section>
  );
}
