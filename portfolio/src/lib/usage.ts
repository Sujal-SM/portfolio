import { experience, projects } from "../data/resume";

// "Kubernetes (K8s)" -> ["kubernetes", "k8s"]; "AWS (EKS, EC2, ...)" -> ["aws", "eks", "ec2", ...]
function terms(skill: string): string[] {
  const m = skill.match(/^([^(]+)\(([^)]+)\)/);
  const parts = m ? [m[1], ...m[2].split(",")] : [skill];
  return parts.map((p) => p.trim().toLowerCase()).filter((p) => p.length > 1);
}

// Where a skill shows up in the resume's projects and experience (exact data, no guessing).
export function whereUsed(skill: string): { label: string; kind: "project" | "experience"; slug?: string }[] {
  const t = terms(skill);
  const hit = (text: string) => {
    const s = text.toLowerCase();
    return t.some((x) => new RegExp(`(^|[^a-z0-9])${x.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&")}([^a-z0-9]|$)`).test(s));
  };
  const out: { label: string; kind: "project" | "experience"; slug?: string }[] = [];
  for (const p of projects) {
    if (hit([p.summary, ...p.details, ...p.stack].join(" | "))) out.push({ label: p.name, kind: "project", slug: p.slug });
  }
  for (const e of experience) {
    if (hit([e.summary, ...e.points, ...e.tags].join(" | "))) out.push({ label: `${e.role}, ${e.company}`, kind: "experience" });
  }
  return out;
}
