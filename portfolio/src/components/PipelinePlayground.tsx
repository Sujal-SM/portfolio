import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

// Hands-on version of the Retail Store Sample App pipeline.
// Break something, run it, watch where it stops and the alert fire, then fix and rerun.
type Status = "idle" | "running" | "pass" | "fail" | "skip";

const STAGES = [
  { id: "build", name: "GitHub Actions", ok: "build and unit tests passed", bad: "unit tests failed in the cart service" },
  { id: "sonar", name: "SonarQube", ok: "quality gate passed", bad: "quality gate failed: new code smells" },
  { id: "trivy", name: "Trivy scan", ok: "no critical CVEs in images", bad: "critical CVE found in base image" },
  { id: "argo", name: "ArgoCD sync", ok: "manifests synced, app healthy", bad: "sync failed: invalid manifest" },
  { id: "eks", name: "EKS rollout", ok: "all pods Running", bad: "rollout stuck: CrashLoopBackOff" },
] as const;

type StageId = (typeof STAGES)[number]["id"];

const FAULTS: { id: StageId; label: string }[] = [
  { id: "build", label: "break a unit test" },
  { id: "trivy", label: "use a vulnerable image" },
  { id: "argo", label: "push a bad manifest" },
];

export function PipelinePlayground() {
  const [fault, setFault] = useState<StageId | null>(null);
  const [status, setStatus] = useState<Record<string, Status>>({});
  const [log, setLog] = useState<{ t: string; kind: "ok" | "bad" | "info" }[]>([]);
  const [running, setRunning] = useState(false);
  const [alert, setAlert] = useState<string | null>(null);
  const [runs, setRuns] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  useEffect(() => { logRef.current?.scrollTo({ top: logRef.current.scrollHeight }); }, [log]);

  function run(f: StageId | null = fault) {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    const n = runs + 1;
    setRuns(n);
    setRunning(true);
    setAlert(null);
    setStatus({});
    setLog([{ t: `run #${n}: git push origin main`, kind: "info" }]);
    let t = 300;
    let failed = false;
    for (const s of STAGES) {
      const at = t;
      if (failed) {
        timers.current.push(setTimeout(() => setStatus((st) => ({ ...st, [s.id]: "skip" })), at));
        continue;
      }
      const bad = f === s.id;
      timers.current.push(setTimeout(() => setStatus((st) => ({ ...st, [s.id]: "running" })), at));
      timers.current.push(
        setTimeout(() => {
          setStatus((st) => ({ ...st, [s.id]: bad ? "fail" : "pass" }));
          setLog((l) => [...l, { t: `${s.name}: ${bad ? s.bad : s.ok}`, kind: bad ? "bad" : "ok" }]);
          if (bad) {
            setAlert(`Deploy failed at ${s.name}. Email alert sent.`);
            setRunning(false);
          }
        }, at + 900),
      );
      t += 1150;
      if (bad) failed = true;
    }
    if (!failed) {
      timers.current.push(setTimeout(() => {
        setLog((l) => [...l, { t: "deployed. Prometheus and Grafana watching.", kind: "info" }]);
        setRunning(false);
      }, t));
    }
  }

  const dot = (s: Status | undefined) =>
    s === "pass" ? "bg-phos text-black" :
    s === "fail" ? "bg-[#c86b5e] text-black" :
    s === "running" ? "border border-phos text-phos" :
    s === "skip" ? "border border-line text-faint" : "border border-line text-faint";

  return (
    <div className="mt-14 rounded-md border border-line bg-panel/80 p-5 backdrop-blur-sm sm:p-7">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h3 className="text-xl font-semibold text-fg">Run it yourself</h3>
        <p className="font-mono text-xs text-faint">simulated, based on the project's pipeline</p>
      </div>
      <p className="mt-2 max-w-[60ch] text-sm text-dim">Break something on purpose, then run the pipeline. See where it stops and how the failure alert fires. Fix it and run again.</p>

      <fieldset className="mt-5">
        <legend className="mb-2 font-mono text-xs text-faint">inject a fault</legend>
        <div className="flex flex-wrap gap-2">
          {[{ id: null, label: "no fault" }, ...FAULTS].map((f) => {
            const on = fault === f.id;
            return (
              <button
                key={f.label}
                type="button"
                aria-pressed={on}
                disabled={running}
                onClick={() => setFault(f.id as StageId | null)}
                className={`rounded border px-3 py-1.5 font-mono text-xs transition-colors disabled:opacity-50 ${
                  on ? (f.id ? "border-[#c86b5e] text-[#e0a198]" : "border-phos-dim text-phos") : "border-line text-dim hover:text-fg"
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <ol className="mt-6 flex flex-wrap items-center gap-y-3" aria-label="Pipeline stages">
        {STAGES.map((s, i) => {
          const st = status[s.id];
          return (
            <li key={s.id} className="flex items-center">
              <div className="flex items-center gap-2">
                <motion.span
                  animate={st === "running" ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                  transition={{ duration: 0.7, repeat: st === "running" ? Infinity : 0 }}
                  className={`grid size-6 place-items-center rounded-full font-mono text-[11px] font-bold ${dot(st)}`}
                  aria-hidden="true"
                >
                  {st === "pass" ? "✓" : st === "fail" ? "×" : st === "skip" ? "-" : i + 1}
                </motion.span>
                <span className={`font-mono text-xs sm:text-sm ${st === "skip" ? "text-faint line-through" : st === "fail" ? "text-[#e0a198]" : "text-fg"}`}>
                  {s.name}
                  <span className="sr-only">: {st ?? "waiting"}</span>
                </span>
              </div>
              {i < STAGES.length - 1 && (
                <span className="mx-3 h-px w-6 overflow-hidden bg-line sm:w-10" aria-hidden="true">
                  <motion.span className="block h-full bg-phos" initial={false} animate={{ width: st === "pass" ? "100%" : "0%" }} transition={{ duration: 0.3 }} />
                </span>
              )}
            </li>
          );
        })}
      </ol>

      <div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
        <div ref={logRef} role="log" aria-live="polite" className="term-scroll h-36 overflow-y-auto rounded border border-line bg-void p-3 font-mono text-xs leading-relaxed">
          {log.length === 0 && <p className="text-faint">pipeline logs show up here.</p>}
          {log.map((l, i) => (
            <p key={i} className={l.kind === "bad" ? "text-[#e0a198]" : l.kind === "ok" ? "text-phos" : "text-dim"}>
              {l.kind === "bad" ? "✗ " : l.kind === "ok" ? "✓ " : "$ "}{l.t}
            </p>
          ))}
        </div>
        <div className="flex gap-2 md:flex-col">
          <button type="button" onClick={() => run()} disabled={running} className="rounded bg-phos px-5 py-2.5 font-mono text-sm font-semibold text-black transition hover:brightness-110 disabled:opacity-60">
            {running ? "running..." : runs ? "Run again" : "Run pipeline"}
          </button>
          {alert && fault && !running && (
            <button type="button" onClick={() => { setFault(null); run(null); }} className="rounded border border-phos-dim px-5 py-2.5 font-mono text-sm text-phos hover:bg-panel-2">
              Fix and rerun
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {alert && (
          <motion.div
            role="alert"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 flex items-center gap-3 rounded border border-[#c86b5e]/60 bg-[#c86b5e]/10 px-4 py-3 font-mono text-xs text-[#e0a198]"
          >
            <span aria-hidden="true">✉</span> {alert}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
