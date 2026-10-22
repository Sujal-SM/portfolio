import { certifications, education, experience, profile, projects, publications, skills } from "./resume";

// Plain-text version of the resume. Used as the chatbot's only source of truth
// and by the offline fallback search.
export function resumeText(): string {
  return [
    `Name: ${profile.name}. Role: ${profile.role}. ${profile.intro}`,
    `Contact: email ${profile.email}, phone ${profile.phone}, GitHub ${profile.github.url}, LinkedIn ${profile.linkedin.url}.`,
    ...experience.map((e) => `Experience: ${e.role} at ${e.company} (${e.period}). ${e.summary} ${e.points.join(" ")}`),
    ...projects.map((p) => `Project: ${p.name}. ${p.summary} ${p.details.join(". ")}. Stack: ${p.stack.join(", ")}.${p.repo ? ` Repo: ${p.repo}.` : ""}${p.demo ? ` Live demo: ${p.demo}.` : ""}`),
    ...education.map((e) => `Education: ${e.degree}, ${e.school}, ${e.period}, ${e.score}.`),
    ...certifications.map((c) => `Certification: ${c.name} (${c.issuer}).`),
    ...publications.map((p) => `Publication: ${p.type}: ${p.title}.`),
    ...skills.map((s) => `Skills (${s.group}): ${s.items.join(", ")}.`),
  ].join("\n");
}
