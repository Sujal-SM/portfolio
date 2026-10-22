import { useState } from "react";
import { motion } from "framer-motion";
import { certifications, internshipCertificate as IC, publications } from "../data/resume";
import { driveThumb, viewDoc } from "../lib/bus";
import { Section } from "./Section";

// level comes straight from the certificate's own name
const level = (name: string) => (/professional/i.test(name) ? "Professional" : /specialization/i.test(name) ? "Specialization" : "Certificate");

function Thumb({ url, title }: { url: string; title: string }) {
  const [state, setState] = useState<"loading" | "ok" | "err">("loading");
  const src = driveThumb(url);
  return (
    <div className="relative aspect-[16/10] overflow-hidden border-b border-line bg-void">
      {src && state !== "err" && (
        <img
          src={src}
          alt={`Preview of the ${title} certificate`}
          loading="lazy"
          referrerPolicy="no-referrer"
          onLoad={() => setState("ok")}
          onError={() => setState("err")}
          className={`h-full w-full object-cover object-top transition duration-500 group-hover:scale-[1.03] ${state === "ok" ? "opacity-90" : "opacity-0"}`}
        />
      )}
      {state !== "ok" && (
        // drawn placeholder while loading, or if Drive won't serve a thumbnail
        <div className="desk absolute inset-0 grid place-items-center">
          <div className="w-3/4 rounded border border-line bg-panel p-4 text-center">
            <div className="mx-auto mb-3 h-1 w-16 rounded bg-phos-dim" />
            <p className="font-mono text-[10px] uppercase tracking-widest text-faint">certificate</p>
            <p className="mt-1 line-clamp-2 text-xs text-dim">{title}</p>
            <div className="mx-auto mt-3 size-6 rounded-full border-2 border-phos-dim" />
          </div>
        </div>
      )}
      <span className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-panel to-transparent" aria-hidden="true" />
    </div>
  );
}

export function Certifications() {
  const [view, setView] = useState<"grid" | "list">("grid");

  return (
    <Section id="certs" index={6} command="verify --certs --papers" title="Certifications and publications">
      <div className="mb-6 flex items-center gap-4">
        <p className="shrink-0 font-mono text-xs uppercase tracking-[0.18em] text-dim">
          Certifications <span className="text-faint">·</span> <span className="text-fg">{certifications.length}</span>
        </p>
        <span className="h-px flex-1 bg-line" aria-hidden="true" />
        <div className="flex overflow-hidden rounded border border-line" role="group" aria-label="Layout">
          {(["grid", "list"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              aria-pressed={view === v}
              aria-label={`${v} view`}
              className={`px-2.5 py-1.5 font-mono text-xs ${view === v ? "bg-panel-2 text-phos" : "text-dim hover:text-fg"}`}
            >
              {v === "grid" ? "▦" : "≡"}
            </button>
          ))}
        </div>
      </div>

      <ul className={view === "grid" ? "grid gap-5 sm:grid-cols-2 lg:grid-cols-3" : "space-y-3"}>
        {certifications.map((c, i) => {
          const lv = level(c.name);
          return (
            <motion.li
              key={c.name}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.08, duration: 0.35 }}
              className={`group overflow-hidden rounded-xl border border-line bg-panel transition-colors hover:border-phos-dim ${view === "list" ? "sm:grid sm:grid-cols-[220px_1fr]" : "flex flex-col"}`}
            >
              <div className="relative">
                <button type="button" onClick={() => viewDoc(c.name, c.url)} aria-label={`Preview certificate: ${c.name}`} className="block w-full text-left">
                  <Thumb url={c.url} title={c.name} />
                </button>
                <a
                  href={c.url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Open ${c.name} in Google Drive`}
                  className="absolute right-3 top-3 rounded border border-line bg-void/80 px-2 py-1 font-mono text-[11px] text-dim backdrop-blur hover:border-phos-dim hover:text-phos"
                >
                  Drive ↗
                </a>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-dim">
                    {c.issuer}
                  </p>
                  <span className={`rounded px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider ${lv === "Professional" ? "bg-phos/15 text-phos" : "bg-[#8fb6d8]/15 text-[#8fb6d8]"}`}>
                    {lv}
                  </span>
                </div>
                <h3 className="mt-3 text-lg font-semibold leading-snug text-fg">{c.name}</h3>
                <div className="mt-auto flex flex-wrap items-center gap-2 pt-5 font-mono text-xs">
                  <button type="button" onClick={() => viewDoc(c.name, c.url)} className="rounded bg-phos px-3 py-1.5 font-semibold text-black transition hover:brightness-110">
                    View certificate
                  </button>
                  {c.scoreReport && (
                    <button type="button" onClick={() => viewDoc(`${c.name}: score report`, c.scoreReport!)} aria-label={`View score report: ${c.name}`} className="rounded border border-line px-3 py-1.5 text-fg hover:border-phos hover:text-phos">
                      Score report
                    </button>
                  )}
                </div>
              </div>
            </motion.li>
          );
        })}
      </ul>

      <div className="mb-6 mt-16 flex items-center gap-4">
        <p className="shrink-0 font-mono text-xs uppercase tracking-[0.18em] text-dim">
          Experience letters <span className="text-faint">·</span> <span className="text-fg">1</span>
        </p>
        <span className="h-px flex-1 bg-line" aria-hidden="true" />
      </div>
      <div className="group grid overflow-hidden rounded-xl border border-line bg-panel transition-colors hover:border-phos-dim sm:grid-cols-[280px_1fr]">
        <button type="button" onClick={() => viewDoc(`${IC.title}: ${IC.company}`, IC.pdf, IC.image)} aria-label={`View ${IC.title}`} className="relative block overflow-hidden bg-white">
          <img src={IC.image} alt="" loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
        </button>
        <div className="flex flex-col p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-dim">{IC.company}</p>
            <span className="rounded bg-phos/15 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-phos">Internship</span>
          </div>
          <h3 className="mt-3 text-lg font-semibold text-fg">{IC.title}</h3>
          <p className="mt-1 text-sm text-dim">{IC.role}, {IC.duration} ({IC.startLabel} to {IC.endLabel}). Signed by {IC.signedBy}, {IC.signerTitle}.</p>
          <div className="mt-auto flex flex-wrap gap-2 pt-5 font-mono text-xs">
            <button type="button" onClick={() => viewDoc(`${IC.title}: ${IC.company}`, IC.pdf, IC.image)} className="rounded bg-phos px-3 py-1.5 font-semibold text-black hover:brightness-110">View certificate</button>
            <a href={IC.pdf} download="Internship_Certificate_Sujal_Malhotra.pdf" className="rounded border border-line px-3 py-1.5 text-fg hover:border-phos hover:text-phos">Download PDF</a>
          </div>
        </div>
      </div>

      <div className="mb-6 mt-16 flex items-center gap-4">
        <p className="shrink-0 font-mono text-xs uppercase tracking-[0.18em] text-dim">
          Publications <span className="text-faint">·</span> <span className="text-fg">{publications.length}</span>
        </p>
        <span className="h-px flex-1 bg-line" aria-hidden="true" />
      </div>
      <ul className="space-y-4">
        {publications.map((p) => (
          <li key={p.title} className="rounded-xl border border-line bg-panel p-6">
            <span className="rounded bg-panel-2 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-dim">{p.type}</span>
            <p className="mt-3 max-w-[70ch] text-lg leading-snug text-fg">{p.title}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}
