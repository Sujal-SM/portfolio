import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { profile, RESUME_URL } from "../data/resume";
import { Section } from "./Section";
import { ContactForm } from "./ContactForm";

export function Contact() {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${profile.email}`;
    }
  }
  const rows = [
    { k: "github", v: `github.com/${profile.github.label}`, href: profile.github.url },
    { k: "linkedin", v: profile.linkedin.label, href: profile.linkedin.url },
    { k: "phone", v: profile.phone, href: profile.phoneHref },
    ...(RESUME_URL ? [{ k: "resume", v: "resume.pdf", href: RESUME_URL }] : []),
  ];
  return (
    <Section id="contact" index={7} command="ssh hello@sujal" title="Contact">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr]">
        <div>
      <p className="max-w-[55ch] text-lg text-dim">Open to cloud, DevOps and platform engineering roles. Email is the fastest way to reach me.</p>
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <a href={`mailto:${profile.email}`} className="glow break-all font-mono text-xl text-phos underline decoration-phos-dim underline-offset-8 hover:decoration-phos sm:text-2xl">
          {profile.email}
        </a>
        <button type="button" onClick={copy} className="rounded border border-line px-3 py-1.5 font-mono text-xs text-dim hover:border-phos hover:text-phos">
          {copied ? "copied" : "copy"}
        </button>
        <span role="status" className="sr-only">{copied ? "Email copied to clipboard" : ""}</span>
        <AnimatePresence>
          {copied && (
            <motion.span initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="font-mono text-xs text-phos" aria-hidden="true">
              ✓ in clipboard
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      <dl className="mt-12 grid max-w-xl grid-cols-[6rem_1fr] gap-y-3 font-mono text-sm">
        {rows.map((r) => (
          <div key={r.k} className="contents">
            <dt className="text-faint">{r.k}</dt>
            <dd>
              <a href={r.href} target={r.href.startsWith("http") || r.href.endsWith(".pdf") ? "_blank" : undefined} rel="noreferrer" className="text-fg hover:text-phos">{r.v}</a>
            </dd>
          </div>
        ))}
      </dl>
        </div>
        <ContactForm />
      </div>
    </Section>
  );
}
