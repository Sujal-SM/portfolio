import { useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { profile } from "../data/resume";

// Sends through Formspree when VITE_FORMSPREE_ID is set (free plan is enough).
// Without it, the form opens the visitor's email app with everything filled in.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const FORM_ID: string | undefined = (import.meta as any).env?.VITE_FORMSPREE_ID || undefined;

type State = "idle" | "sending" | "sent" | "error";

export function ContactForm() {
  const [f, setF] = useState({ name: "", email: "", message: "", company: "" }); // company = honeypot
  const [state, setState] = useState<State>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const e: Record<string, string> = {};
    if (!f.name.trim()) e.name = "Add your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = "Add an email address Sujal can reply to.";
    if (f.message.trim().length < 10) e.message = "Write at least a short sentence.";
    setErrors(e);
    return !Object.keys(e).length;
  }

  async function submit(ev: FormEvent) {
    ev.preventDefault();
    if (f.company) return; // bots fill hidden fields
    if (!validate()) return;
    if (!FORM_ID) {
      const subject = encodeURIComponent(`Portfolio message from ${f.name}`);
      const body = encodeURIComponent(`${f.message}\n\n${f.name}\n${f.email}`);
      window.location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`;
      setState("sent");
      return;
    }
    setState("sending");
    try {
      const r = await fetch(`https://formspree.io/f/${FORM_ID}`, {
        method: "POST",
        headers: { "content-type": "application/json", accept: "application/json" },
        body: JSON.stringify({ name: f.name, email: f.email, message: f.message }),
      });
      setState(r.ok ? "sent" : "error");
      if (r.ok) setF({ name: "", email: "", message: "", company: "" });
    } catch {
      setState("error");
    }
  }

  const field = "w-full rounded border bg-panel px-3 py-2.5 text-fg placeholder:text-faint focus:border-phos-dim";
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => { setF({ ...f, [k]: e.target.value }); if (errors[k]) setErrors({ ...errors, [k]: "" }); };

  return (
    <form onSubmit={submit} noValidate className="space-y-4 rounded-md border border-line bg-panel/70 p-5 backdrop-blur-sm sm:p-6">
      <p className="font-mono text-sm text-dim"><span className="text-phos">$</span> mail sujal</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="cf-name" className="mb-1 block font-mono text-xs text-faint">name</label>
          <input id="cf-name" value={f.name} onChange={set("name")} autoComplete="name" aria-invalid={!!errors.name} aria-describedby="cf-name-err" className={`${field} ${errors.name ? "border-[#c86b5e]" : "border-line"}`} />
          {errors.name && <p id="cf-name-err" className="mt-1 text-xs text-[#e0a198]">{errors.name}</p>}
        </div>
        <div>
          <label htmlFor="cf-email" className="mb-1 block font-mono text-xs text-faint">email</label>
          <input id="cf-email" type="email" value={f.email} onChange={set("email")} autoComplete="email" aria-invalid={!!errors.email} aria-describedby="cf-email-err" className={`${field} ${errors.email ? "border-[#c86b5e]" : "border-line"}`} />
          {errors.email && <p id="cf-email-err" className="mt-1 text-xs text-[#e0a198]">{errors.email}</p>}
        </div>
      </div>
      <div>
        <label htmlFor="cf-msg" className="mb-1 block font-mono text-xs text-faint">message</label>
        <textarea id="cf-msg" rows={4} value={f.message} onChange={set("message")} aria-invalid={!!errors.message} aria-describedby="cf-msg-err" placeholder="Role, team, what you'd like to talk about..." className={`${field} resize-y ${errors.message ? "border-[#c86b5e]" : "border-line"}`} />
        {errors.message && <p id="cf-msg-err" className="mt-1 text-xs text-[#e0a198]">{errors.message}</p>}
      </div>
      <input tabIndex={-1} autoComplete="off" value={f.company} onChange={set("company")} className="hidden" aria-hidden="true" name="company" />
      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" disabled={state === "sending"} className="rounded bg-phos px-5 py-2.5 font-mono text-sm font-semibold text-black transition hover:brightness-110 disabled:opacity-60">
          {state === "sending" ? "sending..." : "Send message"}
        </button>
        <AnimatePresence mode="wait">
          {state === "sent" && (
            <motion.p key="ok" role="status" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-mono text-xs text-phos">
              {FORM_ID ? "Sent. Sujal will reply by email." : "Your email app opened with the message ready to send."}
            </motion.p>
          )}
          {state === "error" && (
            <motion.p key="err" role="alert" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-mono text-xs text-[#e0a198]">
              Message didn't send. Email {profile.email} directly.
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </form>
  );
}
