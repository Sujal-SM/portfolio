import { resumeText } from "../data/resumeText";

const STOP = new Set("a an the is are was were what which who whom how does did do has have his he him sujal malhotra about tell me of in on at for to and or with any your you can could please".split(" "));

// Offline fallback: return the resume lines that share the most words with the question.
// map everyday words to the labels used in the resume text
const SYN: Record<string, string> = {
  cert: "certification", certs: "certification", certificate: "certification", certificates: "certification", certified: "certification",
  job: "experience", jobs: "experience", work: "experience", worked: "experience", internship: "intern", interned: "intern",
  college: "education", university: "education", school: "education", study: "education", studies: "education", cgpa: "cgpa", gpa: "cgpa",
  email: "contact", phone: "contact", reach: "contact", hire: "contact",
  paper: "publication", papers: "publication", research: "publication",
  projects: "project", built: "project", build: "project", made: "project",
  skills: "skills", tools: "skills", stack: "stack", k8s: "kubernetes",
};

const norm = (w: string) => SYN[w] ?? (w.length > 4 && w.endsWith("s") ? w.slice(0, -1) : w);

export function localAnswer(q: string): string[] {
  const words = q.toLowerCase().replace(/[^a-z0-9+#. -]/g, " ").split(/\s+/).filter((w) => w.length > 1 && !STOP.has(w)).map(norm);
  if (!words.length) return [];
  return resumeText()
    .split("\n")
    .map((line) => ({ line, s: words.filter((w) => line.toLowerCase().includes(w)).length }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, 3)
    .map((x) => x.line);
}

export async function ask(q: string): Promise<{ answer: string; source: "ai" | "local" }> {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 15000);
    const r = await fetch("/api/ask", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ question: q }), signal: ctrl.signal });
    clearTimeout(t);
    if (r.ok) {
      const d = (await r.json()) as { answer?: string };
      if (d.answer) return { answer: d.answer, source: "ai" };
    }
  } catch { /* fall through to local */ }
  const lines = localAnswer(q);
  return {
    answer: lines.length ? lines.join("\n") : "Nothing in the resume matches that. Try asking about projects, skills, certifications or experience.",
    source: "local",
  };
}
