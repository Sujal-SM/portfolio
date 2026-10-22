import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { on } from "../lib/bus";
import { accentRGB } from "../lib/theme";

type Game = "snake" | "type";

const best = (k: string) => { try { return Number(localStorage.getItem(k) || 0); } catch { return 0; } };
const saveBest = (k: string, v: number) => { try { localStorage.setItem(k, String(v)); } catch { /* ignore */ } };

/* ---------------- snake ---------------- */

const N = 20;
type P = { x: number; y: number };

function Snake() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const dir = useRef<P>({ x: 1, y: 0 });
  const queue = useRef<P[]>([]);
  const [score, setScore] = useState(0);
  const [hi, setHi] = useState(() => best("snake-best"));
  const [state, setState] = useState<"ready" | "play" | "over">("ready");
  const touch = useRef<P | null>(null);

  const turn = useCallback((d: P) => {
    const last = queue.current[queue.current.length - 1] ?? dir.current;
    if (d.x === -last.x && d.y === -last.y) return; // no reversing into yourself
    if (queue.current.length < 3) queue.current.push(d);
  }, []);

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      const m: Record<string, P> = { ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 }, ArrowLeft: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 }, w: { x: 0, y: -1 }, s: { x: 0, y: 1 }, a: { x: -1, y: 0 }, d: { x: 1, y: 0 } };
      if (m[e.key]) { e.preventDefault(); if (state !== "play") setState("play"); turn(m[e.key]); }
      if (e.key === " " && state !== "play") { e.preventDefault(); setState("play"); }
    };
    addEventListener("keydown", k);
    return () => removeEventListener("keydown", k);
  }, [state, turn]);

  useEffect(() => {
    const c = canvas.current!;
    const ctx = c.getContext("2d")!;
    const size = c.width / N;
    const rgb = accentRGB();
    let snake: P[] = [{ x: 8, y: 10 }, { x: 7, y: 10 }, { x: 6, y: 10 }];
    let food: P = { x: 14, y: 10 };
    let sc = 0;

    const place = () => {
      do food = { x: Math.floor(Math.random() * N), y: Math.floor(Math.random() * N) };
      while (snake.some((p) => p.x === food.x && p.y === food.y));
    };

    const draw = () => {
      ctx.fillStyle = "#050605";
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.fillStyle = "rgba(255,255,255,0.03)";
      for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) ctx.fillRect(i * size + size / 2 - 1, j * size + size / 2 - 1, 2, 2);
      ctx.fillStyle = "#d6b06f";
      ctx.fillRect(food.x * size + 3, food.y * size + 3, size - 6, size - 6);
      snake.forEach((p, i) => {
        ctx.fillStyle = `rgba(${rgb},${i === 0 ? 1 : Math.max(0.35, 1 - i * 0.04)})`;
        ctx.fillRect(p.x * size + 1, p.y * size + 1, size - 2, size - 2);
      });
    };

    if (state !== "play") { draw(); return; }
    dir.current = { x: 1, y: 0 };
    queue.current = [];
    setScore(0);
    const iv = setInterval(() => {
      if (queue.current.length) dir.current = queue.current.shift()!;
      const head = { x: snake[0].x + dir.current.x, y: snake[0].y + dir.current.y };
      if (head.x < 0 || head.y < 0 || head.x >= N || head.y >= N || snake.some((p) => p.x === head.x && p.y === head.y)) {
        clearInterval(iv);
        setState("over");
        setHi((h) => { const v = Math.max(h, sc); saveBest("snake-best", v); return v; });
        return;
      }
      snake = [head, ...snake];
      if (head.x === food.x && head.y === food.y) { sc += 1; setScore(sc); place(); }
      else snake.pop();
      draw();
    }, 110);
    draw();
    return () => clearInterval(iv);
  }, [state]);

  return (
    <div className="flex flex-col items-center">
      <div className="mb-3 flex w-full max-w-[360px] justify-between font-mono text-xs text-dim">
        <span>score <span className="text-phos">{score}</span></span>
        <span>best <span className="text-phos">{hi}</span></span>
      </div>
      <div className="relative">
        <canvas
          ref={canvas}
          width={360}
          height={360}
          className="aspect-square w-full max-w-[360px] touch-none rounded border border-line"
          aria-label="Snake game board"
          onTouchStart={(e) => { touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; if (state !== "play") setState("play"); }}
          onTouchMove={(e) => {
            if (!touch.current) return;
            const dx = e.touches[0].clientX - touch.current.x, dy = e.touches[0].clientY - touch.current.y;
            if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
            turn(Math.abs(dx) > Math.abs(dy) ? { x: Math.sign(dx), y: 0 } : { x: 0, y: Math.sign(dy) });
            touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
          }}
        />
        {state !== "play" && (
          <button type="button" onClick={() => setState("play")} className="absolute inset-0 grid place-items-center bg-black/60 font-mono text-sm text-fg">
            <span>
              {state === "over" ? <>game over, score {score}<br /></> : null}
              <span className="text-phos">{state === "over" ? "play again" : "start"}</span>
              <span className="mt-1 block text-xs text-faint">arrows / wasd, or swipe</span>
            </span>
          </button>
        )}
      </div>
    </div>
  );
}

/* ---------------- kubectl typing test ---------------- */

// commands from the tools on Sujal's resume
const CMDS = [
  "kubectl get pods -n retail-store",
  "terraform apply -auto-approve",
  "docker build -t retail-ui .",
  "git push origin main",
  "argocd app sync retail-store",
  "helm upgrade --install retail ./chart",
  "kubectl rollout status deploy/ui",
  "terraform plan -out tfplan",
  "aws eks update-kubeconfig --name retail",
  "trivy image retail-ui:latest",
  "kubectl logs deploy/catalog -f",
  "docker compose up -d",
];
const DURATION = 30;

function TypeTest() {
  const [order] = useState(() => [...CMDS].sort(() => Math.random() - 0.5));
  const [idx, setIdx] = useState(0);
  const [val, setVal] = useState("");
  const [left, setLeft] = useState(DURATION);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [chars, setChars] = useState({ ok: 0, total: 0 });
  const start = useRef(0);
  const [hi, setHi] = useState(() => best("type-best"));
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => { input.current?.focus(); }, []);
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setLeft((l) => {
      if (l <= 1) { clearInterval(t); setRunning(false); setDone(true); return 0; }
      return l - 1;
    }), 1000);
    return () => clearInterval(t);
  }, [running]);

  const target = order[idx % order.length];
  // words = 5 characters; measured against real elapsed time (min 5s so the first keys don't spike it)
  const elapsed = done ? DURATION : start.current ? Math.max(5, (Date.now() - start.current) / 1000) : DURATION;
  const wpm = Math.round((chars.ok / 5) / (elapsed / 60));
  const acc = chars.total ? Math.round((chars.ok / chars.total) * 100) : 100;

  useEffect(() => {
    if (done) setHi((h) => { const v = Math.max(h, wpm); saveBest("type-best", v); return v; });
  }, [done]); // eslint-disable-line react-hooks/exhaustive-deps

  function restart() {
    start.current = 0;
    setIdx(0); setVal(""); setLeft(DURATION); setRunning(false); setDone(false); setChars({ ok: 0, total: 0 });
    setTimeout(() => input.current?.focus(), 0);
  }

  return (
    <div className="font-mono">
      <div className="mb-4 flex flex-wrap justify-between gap-3 text-xs text-dim">
        <span>time <span className="text-phos">{left}s</span></span>
        <span>wpm <span className="text-phos">{done || running ? wpm : 0}</span></span>
        <span>accuracy <span className="text-phos">{acc}%</span></span>
        <span>best <span className="text-phos">{hi} wpm</span></span>
      </div>
      {!done ? (
        <>
          <p className="rounded border border-line bg-void px-4 py-4 text-sm sm:text-base" aria-label={`Type: ${target}`}>
            <span className="text-faint">$ </span>
            {target.split("").map((ch, i) => (
              <span key={i} className={i < val.length ? (val[i] === ch ? "text-phos" : "bg-[#c86b5e]/40 text-fg") : i === val.length ? "border-b border-phos text-fg" : "text-faint"}>{ch}</span>
            ))}
          </p>
          <input
            ref={input}
            value={val}
            aria-label="Type the command shown above, then press Enter"
            autoComplete="off" autoCapitalize="off" autoCorrect="off" spellCheck={false}
            onChange={(e) => {
              if (!running && !done) { setRunning(true); start.current = Date.now(); }
              const v = e.target.value;
              if (v.length > val.length) {
                const ch = v[v.length - 1];
                setChars((c) => ({ ok: c.ok + (ch === target[v.length - 1] ? 1 : 0), total: c.total + 1 }));
              }
              setVal(v);
              if (v === target) { setIdx((i) => i + 1); setVal(""); }
            }}
            onKeyDown={(e) => { if (e.key === "Enter" && val.length) { setIdx((i) => i + 1); setVal(""); } }}
            className="mt-3 w-full rounded border border-line bg-panel-2 px-4 py-3 text-sm text-fg outline-none focus:border-phos-dim"
            placeholder="start typing to begin the 30s timer"
          />
          <p className="mt-2 text-xs text-faint">{idx} commands done. A finished command moves on by itself.</p>
        </>
      ) : (
        <div className="rounded border border-line bg-void p-6 text-center">
          <p className="text-3xl text-phos">{wpm} wpm</p>
          <p className="mt-1 text-sm text-dim">{acc}% accuracy, {idx} commands</p>
          <button type="button" onClick={restart} className="mt-5 rounded bg-phos px-4 py-2 text-sm font-semibold text-black">try again</button>
        </div>
      )}
    </div>
  );
}

/* ---------------- modal ---------------- */

export function Games() {
  const [game, setGame] = useState<Game | null>(null);
  useEffect(() => on("open-game", (g) => setGame(g)), []);
  useEffect(() => {
    if (!game) return;
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") setGame(null); };
    addEventListener("keydown", k);
    return () => removeEventListener("keydown", k);
  }, [game]);

  return (
    <AnimatePresence>
      {game && (
        <motion.div
          className="fixed inset-0 z-[75] grid place-items-center bg-black/80 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onMouseDown={(e) => { if (e.target === e.currentTarget) setGame(null); }}
        >
          <motion.div role="dialog" aria-modal="true" aria-label={game === "snake" ? "Snake" : "kubectl typing test"}
            initial={{ scale: 0.96 }} animate={{ scale: 1 }}
            className="w-full max-w-lg rounded-md border border-line bg-panel p-5 sm:p-6">
            <div className="mb-4 flex items-center gap-2 font-mono text-xs">
              {(["snake", "type"] as const).map((g) => (
                <button key={g} type="button" onClick={() => setGame(g)} aria-pressed={game === g}
                  className={`rounded px-3 py-1.5 ${game === g ? "bg-panel-2 text-phos" : "text-dim hover:text-fg"}`}>
                  {g === "snake" ? "snake" : "kubectl typing test"}
                </button>
              ))}
              <button type="button" onClick={() => setGame(null)} className="ml-auto rounded border border-line px-2 py-1 text-dim hover:text-phos">esc</button>
            </div>
            {game === "snake" ? <Snake key="s" /> : <TypeTest key="t" />}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
