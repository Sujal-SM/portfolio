import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { SCENES } from "./reel/scenes";
import { Section } from "./Section";
import { PipelinePlayground } from "./PipelinePlayground";

export function DemoReel() {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(!reduce);
  const [visible, setVisible] = useState(false);
  const [run, setRun] = useState(0); // bumps to restart a scene's animation
  const stageRef = useRef<HTMLDivElement>(null);

  // only play while on screen
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.35 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const active = playing && visible;
  const scene = SCENES[i];

  useEffect(() => {
    if (!active) return;
    const t = setTimeout(() => {
      setI((n) => (n + 1) % SCENES.length);
      setRun((r) => r + 1);
    }, scene.ms);
    return () => clearTimeout(t);
  }, [active, i, run, scene.ms]);

  function go(n: number) {
    setI(n);
    setRun((r) => r + 1);
  }

  const Comp = scene.Comp;

  return (
    <Section id="replay" index={1} command="./replay retail-store-sample-app" title="Watch a deploy">
      <p className="-mt-4 mb-8 max-w-[60ch] text-dim">
        A short animated replay of how the Retail Store Sample App ships: push, pipeline checks, Terraform and Kubernetes, then monitoring.
      </p>

      <figure>
        <div
          ref={stageRef}
          className="overflow-hidden rounded-md border border-line bg-void shadow-[0_0_0_1px_rgba(var(--phos-rgb),0.018),0_40px_100px_-40px_rgba(var(--phos-rgb),0.113)]"
        >
          <div className="flex items-center gap-3 border-b border-line bg-panel-2 px-4 py-2.5">
            <div className="flex gap-1.5" aria-hidden="true">
              <span className="size-2.5 rounded-full bg-line" />
              <span className="size-2.5 rounded-full bg-line" />
              <span className="size-2.5 rounded-full bg-phos-dim" />
            </div>
            <p className="truncate font-mono text-xs text-dim">replay: {scene.label.toLowerCase()}</p>
            <button
              type="button"
              onClick={() => setPlaying((p) => !p)}
              className="ml-auto shrink-0 rounded border border-line px-2.5 py-1 font-mono text-xs text-dim hover:border-phos hover:text-phos"
              aria-label={playing ? "Pause replay" : "Play replay"}
            >
              {playing ? "pause" : "play"}
            </button>
          </div>

          <div className="relative aspect-[4/3] sm:aspect-video" aria-live="polite">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${scene.id}-${run}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduce ? 0 : 0.35 }}
                className="absolute inset-0"
              >
                <Comp />
              </motion.div>
            </AnimatePresence>
            <span className="sr-only">Scene {i + 1} of {SCENES.length}: {scene.label}</span>
          </div>

          {/* progress for the current scene */}
          <div className="h-0.5 bg-line" aria-hidden="true">
            <motion.div
              key={`bar-${scene.id}-${run}-${active}`}
              className="h-full bg-phos"
              initial={{ width: active ? "0%" : "100%" }}
              animate={{ width: "100%" }}
              transition={{ duration: active ? scene.ms / 1000 : 0, ease: "linear" }}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Replay scenes">
            {SCENES.map((s, n) => (
              <button
                key={s.id}
                type="button"
                onClick={() => go(n)}
                aria-current={n === i ? "step" : undefined}
                className={`rounded px-2.5 py-1 font-mono text-xs transition-colors ${
                  n === i ? "bg-phos text-black" : "border border-line text-dim hover:border-phos-dim hover:text-phos"
                }`}
              >
                {n + 1}. {s.label}
              </button>
            ))}
          </div>
          <figcaption className="font-mono text-xs text-faint">Illustrative replay, not a screen recording.</figcaption>
        </div>
      </figure>

      <PipelinePlayground />
    </Section>
  );
}
