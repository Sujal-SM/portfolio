import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { Diagram } from "../data/architecture";

const W = 150, H = 40;

// Hover or tap a node: its connections light up and its description shows below.
export function ArchDiagram({ d, title }: { d: Diagram; title: string }) {
  const reduce = useReducedMotion();
  const [sel, setSel] = useState<string | null>(null);
  const byId = Object.fromEntries(d.nodes.map((n) => [n.id, n]));
  const linked = (id: string) => !sel || id === sel || d.edges.some(([a, b]) => (a === sel && b === id) || (b === sel && a === id));
  const maxX = Math.max(...d.nodes.map((n) => n.x)) + W / 2 + 20;
  const maxY = Math.max(...d.nodes.map((n) => n.y)) + H / 2 + 20;
  const cur = sel ? byId[sel] : null;

  return (
    <div>
      <div className="term-scroll overflow-x-auto rounded-md border border-line bg-void">
        <svg viewBox={`0 0 ${maxX} ${maxY}`} className="min-w-[640px]" role="img" aria-label={`${title} architecture diagram`}>
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M0 0 L10 5 L0 10z" fill="var(--color-phos-dim)" />
            </marker>
          </defs>
          {d.edges.map(([a, b]) => {
            const A = byId[a], B = byId[b];
            const on = !sel || a === sel || b === sel;
            // clip the line to the node boxes
            const dx = B.x - A.x, dy = B.y - A.y;
            const t = (n: number) => Math.min(Math.abs((W / 2 + 4) / (dx || 1e-6)), Math.abs((H / 2 + 4) / (dy || 1e-6))) * n;
            const x1 = A.x + dx * t(1), y1 = A.y + dy * t(1), x2 = B.x - dx * t(1), y2 = B.y - dy * t(1);
            return (
              <motion.line
                key={a + b}
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke={on ? "var(--color-phos)" : "var(--color-line)"}
                strokeOpacity={on ? 0.7 : 1}
                strokeWidth="1.5"
                strokeDasharray="5 5"
                markerEnd="url(#arrow)"
                animate={reduce ? {} : { strokeDashoffset: [0, -20] }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            );
          })}
          {d.nodes.map((n) => {
            const on = linked(n.id);
            const isSel = sel === n.id;
            return (
              <g
                key={n.id}
                tabIndex={0}
                role="button"
                aria-label={`${n.label}: ${n.desc}`}
                aria-pressed={isSel}
                onMouseEnter={() => setSel(n.id)}
                onFocus={() => setSel(n.id)}
                onClick={() => setSel(isSel ? null : n.id)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSel(isSel ? null : n.id); } }}
                className="cursor-pointer outline-none"
                style={{ opacity: on ? 1 : 0.35, transition: "opacity 150ms" }}
              >
                <rect x={n.x - W / 2} y={n.y - H / 2} width={W} height={H} rx="6" fill={isSel ? "var(--color-panel-2)" : "var(--color-panel)"} stroke={isSel ? "var(--color-phos)" : "var(--color-line)"} strokeWidth="1.5" />
                <text x={n.x} y={n.y + 4} textAnchor="middle" fontFamily="var(--font-mono)" fontSize={n.label.length > 20 ? 9.5 : 11} fill={isSel ? "var(--color-phos)" : "var(--color-fg)"}>{n.label}</text>
              </g>
            );
          })}
        </svg>
      </div>
      <p className="mt-3 min-h-[2.5rem] font-mono text-sm text-dim" aria-live="polite">
        {cur ? <><span className="text-phos">{cur.label}:</span> {cur.desc}</> : "Hover or tap a block to see what it does."}
      </p>
    </div>
  );
}
