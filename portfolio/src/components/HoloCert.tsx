import { useState } from "react";
import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { internshipCertificate as C, profile } from "../data/resume";
import { viewDoc } from "../lib/bus";

// Real file verification: hash the exact PDF the site serves, in the visitor's browser.
export async function verifyCertificate(): Promise<{ sha: string; bytes: number }> {
  const r = await fetch(C.pdf, { cache: "no-store" });
  if (!r.ok) throw new Error(`could not load the certificate (${r.status})`);
  const buf = await r.arrayBuffer();
  const hash = await crypto.subtle.digest("SHA-256", buf);
  const sha = [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, "0")).join("");
  return { sha, bytes: buf.byteLength };
}

// A credential card: tilts toward the pointer with a holographic sheen, flips for details.
export function HoloCert() {
  const reduce = useReducedMotion();
  const [flipped, setFlipped] = useState(false);
  const [check, setCheck] = useState<{ state: "idle" | "busy" | "ok" | "err"; sha?: string; bytes?: number; msg?: string }>({ state: "idle" });

  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rx = useSpring(useTransform(py, [0, 1], [9, -9]), { stiffness: 180, damping: 18 });
  const ry = useSpring(useTransform(px, [0, 1], [-12, 12]), { stiffness: 180, damping: 18 });
  const gx = useTransform(px, (v) => `${v * 100}%`);
  const gy = useTransform(py, (v) => `${v * 100}%`);
  const sheen = useMotionTemplate`radial-gradient(420px circle at ${gx} ${gy}, rgba(255,255,255,0.22), transparent 45%), linear-gradient(115deg, transparent 20%, rgba(var(--phos-rgb),0.18) 40%, rgba(143,182,216,0.16) 50%, rgba(214,176,111,0.14) 60%, transparent 80%)`;

  async function verify() {
    setCheck({ state: "busy" });
    try {
      const r = await verifyCertificate();
      setCheck({ state: "ok", ...r });
    } catch (e) {
      setCheck({ state: "err", msg: (e as Error).message });
    }
  }

  return (
    <div className="[perspective:1400px]">
      <motion.div
        onPointerMove={(e) => {
          if (reduce || e.pointerType !== "mouse") return;
          const r = e.currentTarget.getBoundingClientRect();
          px.set((e.clientX - r.left) / r.width);
          py.set((e.clientY - r.top) / r.height);
        }}
        onPointerLeave={() => { px.set(0.5); py.set(0.5); }}
        style={reduce ? {} : { rotateX: rx, rotateY: ry }}
        className="relative [transform-style:preserve-3d]"
      >
        <motion.div
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 120, damping: 18 }}
          className="relative aspect-[1200/855] [transform-style:preserve-3d]"
        >
          {/* front: the actual certificate */}
          <button
            type="button"
            onClick={() => setFlipped(true)}
            aria-label="Internship certificate. Flip for details."
            tabIndex={flipped ? -1 : 0}
            aria-hidden={flipped}
            className={`absolute inset-0 overflow-hidden ${flipped ? "pointer-events-none" : ""} rounded-xl border border-line bg-white shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)] [backface-visibility:hidden]`}
          >
            <img src={C.image} alt={`${C.title}: ${profile.name}, ${C.role} at ${C.company}, ${C.startLabel} to ${C.endLabel}`} className="h-full w-full object-cover" loading="lazy" />
            {!reduce && <motion.span aria-hidden="true" className="pointer-events-none absolute inset-0 mix-blend-overlay" style={{ background: sheen }} />}
            <span className="absolute bottom-3 right-3 rounded-full border border-black/10 bg-black/75 px-3 py-1 font-mono text-[11px] text-white backdrop-blur">
              tap to flip ↻
            </span>
          </button>

          {/* back: details + actions */}
          <div
            {...({ inert: flipped ? undefined : "" } as Record<string, string | undefined>)}
            className={`absolute inset-0 flex flex-col overflow-hidden rounded-xl border border-phos-dim bg-panel p-5 [backface-visibility:hidden] [transform:rotateY(180deg)] sm:p-6 ${flipped ? "" : "pointer-events-none"}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-dim">{C.company} · {C.companyType}</p>
                <p className="mt-1 text-lg font-semibold text-fg sm:text-xl">{C.title}</p>
              </div>
              <button type="button" onClick={() => setFlipped(false)} className="shrink-0 rounded border border-line px-2 py-1 font-mono text-xs text-dim hover:text-phos" aria-label="Flip back to the certificate">↻</button>
            </div>
            <dl className="mt-4 grid grid-cols-[6.5rem_1fr] gap-y-1.5 font-mono text-xs sm:text-sm">
              <dt className="text-faint">awarded to</dt><dd className="text-fg">{profile.name}</dd>
              <dt className="text-faint">role</dt><dd className="text-fg">{C.role}</dd>
              <dt className="text-faint">period</dt><dd className="text-fg">{C.startLabel} to {C.endLabel}</dd>
              <dt className="text-faint">issued</dt><dd className="text-fg">{C.issued}</dd>
              <dt className="text-faint">signed by</dt><dd className="text-fg">{C.signedBy}, {C.signerTitle}</dd>
            </dl>
            <div className="mt-auto pt-4">
              <div className="min-h-[2.5rem] font-mono text-[11px] leading-snug" aria-live="polite">
                {check.state === "busy" && <p className="text-dim">hashing the PDF...</p>}
                {check.state === "ok" && (
                  <p className="break-all text-dim">
                    <span className="text-phos">sha256</span> {check.sha} <span className="text-faint">({Math.round((check.bytes ?? 0) / 1024)} KB)</span>
                  </p>
                )}
                {check.state === "err" && <p className="text-[#e0a198]">{check.msg}</p>}
              </div>
              <div className="mt-2 flex flex-wrap gap-2 font-mono text-xs">
                <button type="button" onClick={() => viewDoc(`${C.title}: ${C.company}`, C.pdf, C.image)} className="rounded bg-phos px-3 py-1.5 font-semibold text-black hover:brightness-110">View PDF</button>
                <button type="button" onClick={() => void verify()} className="rounded border border-line px-3 py-1.5 text-fg hover:border-phos hover:text-phos">Hash file</button>
                <a href={C.pdf} download="Internship_Certificate_Sujal_Malhotra.pdf" className="rounded border border-line px-3 py-1.5 text-fg hover:border-phos hover:text-phos">Download</a>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

// 29 Jun -> 29 Sept as a filled bar with month ticks
export function DurationBar() {
  const start = new Date(C.start).getTime();
  const end = new Date(C.end).getTime();
  const months = ["Jul", "Aug", "Sep"].map((m, i) => ({ m, at: (new Date(2026, 6 + i, 1).getTime() - start) / (end - start) }));
  return (
    <div className="font-mono text-xs">
      <div className="flex justify-between text-faint"><span>{C.startLabel}</span><span className="text-phos">{C.duration}</span><span>{C.endLabel}</span></div>
      <div className="relative mt-2 h-2 rounded-full bg-line">
        <motion.div
          className="h-full rounded-full bg-phos"
          initial={{ width: "0%" }}
          whileInView={{ width: "100%" }}
          viewport={{ once: true }}
          transition={{ duration: 1.6, ease: [0.2, 0.7, 0.2, 1] }}
        />
        {months.map((x) => (
          <span key={x.m} className="absolute top-0 h-2 w-px bg-void" style={{ left: `${x.at * 100}%` }} aria-hidden="true" />
        ))}
      </div>
      <div className="relative mt-1 h-4 text-faint" aria-hidden="true">
        {months.map((x) => <span key={x.m} className="absolute -translate-x-1/2" style={{ left: `${x.at * 100}%` }}>{x.m}</span>)}
      </div>
    </div>
  );
}
