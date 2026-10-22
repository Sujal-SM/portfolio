import { useEffect, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { DeskScene } from "./DeskScene";

/* ---------- shared bits ---------- */

function Typed({ text, delay = 0, speed = 38, className }: { text: string; delay?: number; speed?: number; className?: string }) {
  const reduce = useReducedMotion();
  const [n, setN] = useState(reduce ? text.length : 0);
  useEffect(() => {
    if (reduce) return;
    let i = 0;
    let iv: ReturnType<typeof setInterval>;
    const t = setTimeout(() => {
      iv = setInterval(() => {
        i += 1;
        setN(i);
        if (i >= text.length) clearInterval(iv);
      }, speed);
    }, delay * 1000);
    return () => {
      clearTimeout(t);
      clearInterval(iv);
    };
  }, [text, delay, speed, reduce]);
  return <span className={className}>{text.slice(0, n)}</span>;
}

const appear = (delay: number) => ({
  initial: { opacity: 0, y: 4 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.25 },
});

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="w-full max-w-3xl overflow-hidden rounded border border-line bg-panel">
      <div className="border-b border-line px-3 py-1.5 font-mono text-[10px] text-dim sm:text-xs">{title}</div>
      <div className="p-3 sm:p-5">{children}</div>
    </div>
  );
}

/* ---------- scenes ---------- */

// 1. name reveal: characters resolve out of noise
const GLYPHS = "01<>/$#{}[]=+*";
function Scramble({ text }: { text: string }) {
  const reduce = useReducedMotion();
  const [out, setOut] = useState(reduce ? text : text.replace(/\S/g, " "));
  useEffect(() => {
    if (reduce) return;
    let frame = 0;
    const iv = setInterval(() => {
      frame += 1;
      setOut(
        text
          .split("")
          .map((c, i) => (c === " " ? " " : frame > 8 + i * 3 ? c : GLYPHS[(frame + i * 7) % GLYPHS.length]))
          .join(""),
      );
      if (frame > 8 + text.length * 3) clearInterval(iv);
    }, 45);
    return () => clearInterval(iv);
  }, [text, reduce]);
  return <>{out}</>;
}

export function BootScene() {
  return (
    <div className="desk flex h-full flex-col items-center justify-center gap-4 text-center">
      <p className="glow font-mono text-3xl font-semibold text-phos sm:text-6xl" aria-label="sujal@workspace">
        <Scramble text="sujal@workspace" />
      </p>
      <motion.p {...appear(2.2)} className="font-mono text-xs text-dim sm:text-base">
        cloud / devops / ai
      </motion.p>
    </div>
  );
}

export function DeskPushScene() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="h-full max-h-full w-full">
        <DeskScene screen="push" />
      </div>
    </div>
  );
}

const STAGES = ["git push", "GitHub Actions", "SonarQube", "Trivy scan", "ArgoCD sync", "AWS EKS"];

export function PipelineScene() {
  return (
    <div className="flex h-full items-center justify-center p-3 sm:p-10">
      <Panel title="retail-store-sample-app / pipeline">
        <ol className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
          {STAGES.map((s, i) => (
            <motion.li
              key={s}
              initial={{ borderColor: "var(--color-line)", opacity: 0.45 }}
              animate={{ borderColor: "var(--color-phos-dim)", opacity: 1 }}
              transition={{ delay: 0.4 + i * 0.75, duration: 0.3 }}
              className="flex items-center gap-2 rounded border px-2 py-2 font-mono text-[10px] sm:px-4 sm:py-4 sm:text-base"
            >
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.7 + i * 0.75, type: "spring", stiffness: 500, damping: 22 }}
                className="grid size-4 shrink-0 place-items-center rounded-full bg-phos text-[9px] font-bold text-black sm:size-5 sm:text-[11px]"
                aria-hidden="true"
              >
                ✓
              </motion.span>
              <span className="truncate text-fg">{s}</span>
            </motion.li>
          ))}
        </ol>
      </Panel>
    </div>
  );
}

const PODS = ["ui", "catalog", "carts", "orders", "checkout"];

export function TerminalScene() {
  return (
    <div className="flex h-full items-center justify-center p-3 sm:p-10">
      <Panel title="terminal 1">
        <div className="space-y-1 font-mono text-[10px] leading-relaxed sm:text-base">
          <p>
            <span className="text-phos">$ </span>
            <Typed text="terraform apply -auto-approve" delay={0.3} />
          </p>
          <motion.p {...appear(1.8)} className="text-phos">Apply complete!</motion.p>
          <p>
            <span className="text-phos">$ </span>
            <Typed text="kubectl get pods -n retail-store" delay={2.4} />
          </p>
          <div className="grid grid-cols-[6rem_auto] sm:grid-cols-[10rem_auto]">
            {PODS.map((p, i) => (
              <motion.div key={p} {...appear(4 + i * 0.25)} className="contents">
                <span className="text-dim">{p}</span>
                <span className="text-phos">Running</span>
              </motion.div>
            ))}
          </div>
        </div>
      </Panel>
    </div>
  );
}

export function MonitorScene() {
  const reduce = useReducedMotion();
  return (
    <div className="relative flex h-full items-center justify-center p-3 sm:p-10">
      <Panel title="prometheus + grafana">
        <div>
          <p className="font-mono text-[10px] text-dim sm:text-xs">requests / sec</p>
          <svg viewBox="0 0 300 90" preserveAspectRatio="none" className="mt-2 h-28 w-full sm:h-56" aria-hidden="true">
            {[20, 45, 70].map((y) => <line key={y} x1="0" x2="300" y1={y} y2={y} stroke="var(--color-line)" strokeWidth="0.5" />)}
            <motion.path
              d="M0 70 L25 62 L50 66 L75 48 L100 52 L125 38 L150 44 L175 30 L200 34 L225 22 L250 28 L275 18 L300 22"
              fill="none"
              stroke="var(--color-phos)"
              strokeWidth="2"
              initial={{ pathLength: reduce ? 1 : 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2.4, ease: "easeInOut" }}
            />
          </svg>
        </div>
      </Panel>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.8, type: "spring", stiffness: 300, damping: 24 }}
        className="absolute bottom-5 right-5 rounded border border-phos-dim bg-void/95 px-3 py-2 font-mono text-[10px] text-phos shadow-[0_0_24px_rgba(var(--phos-rgb),0.09)] sm:bottom-12 sm:right-12 sm:text-xs"
      >
        ✓ email alert set for failed deploys
      </motion.div>
    </div>
  );
}

const BADGES = [
  { t: "terraform", x: "8%", y: "10%" },
  { t: "kubernetes", x: "30%", y: "2%" },
  { t: "argocd", x: "56%", y: "8%" },
  { t: "aws eks", x: "74%", y: "20%" },
  { t: "oci", x: "4%", y: "32%" },
];

export function OutroScene() {
  return (
    <div className="relative h-full">
      <DeskScene screen="dash" typing={false} />
      {BADGES.map((b, i) => (
        <motion.span
          key={b.t}
          initial={{ opacity: 0, y: 16, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.4 + i * 0.4, type: "spring", stiffness: 380, damping: 20 }}
          style={{ left: b.x, top: b.y }}
          className="absolute rounded border border-phos-dim bg-panel px-2 py-0.5 font-mono text-[10px] text-phos shadow-[0_0_18px_rgba(var(--phos-rgb),0.081)] sm:px-3 sm:py-1 sm:text-sm"
        >
          ✓ {b.t}
        </motion.span>
      ))}
    </div>
  );
}

export const SCENES = [
  { id: "boot", label: "Intro", ms: 4200, Comp: BootScene },
  { id: "push", label: "Push to main", ms: 4500, Comp: DeskPushScene },
  { id: "pipeline", label: "CI/CD pipeline", ms: 6000, Comp: PipelineScene },
  { id: "terminal", label: "Provision and deploy", ms: 6800, Comp: TerminalScene },
  { id: "monitor", label: "Monitoring", ms: 5200, Comp: MonitorScene },
  { id: "outro", label: "Skills used", ms: 4800, Comp: OutroScene },
];
