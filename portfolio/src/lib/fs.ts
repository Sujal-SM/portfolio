import { certifications, education, experience, internshipCertificate as IC, profile, projects, publications } from "../data/resume";

// A tiny read-only filesystem built from the resume data, for cd / ls / cat in the terminal.
export type Node = { type: "dir"; children: Record<string, Node> } | { type: "file"; content: string };

const file = (content: string): Node => ({ type: "file", content });
const dir = (children: Record<string, Node>): Node => ({ type: "dir", children });

export const root: Node = dir({
  "about.txt": file(`${profile.name}\n${profile.role}\n\n${profile.intro}`),
  "contact.txt": file(`email     ${profile.email}\nphone     ${profile.phone}\ngithub    ${profile.github.url}\nlinkedin  ${profile.linkedin.url}`),
  projects: dir(
    Object.fromEntries(
      projects.map((p) => [
        `${p.slug}.md`,
        file(
          `# ${p.name}\n\n${p.summary}\n\n${p.details.map((d) => `- ${d}`).join("\n")}\n\nstack: ${p.stack.join(", ")}` +
            (p.repo ? `\nrepo:  ${p.repo}` : "") + (p.demo ? `\ndemo:  ${p.demo}` : ""),
        ),
      ]),
    ),
  ),
  experience: dir({
    "global-trend-certificate.txt": file(`${IC.title}\n${IC.company} (${IC.companyType})\nrole:    ${IC.role}\nperiod:  ${IC.startLabel} to ${IC.endLabel} (${IC.duration})\nissued:  ${IC.issued}\nsigned:  ${IC.signedBy}, ${IC.signerTitle}\n\nrun "verify" to hash the PDF`),
    "global-trend.md": file(
      experience.map((e) => `# ${e.role}, ${e.company}\n${e.period}\n\n${e.summary}\n\n${e.points.map((p) => `- ${p}`).join("\n")}`).join("\n\n"),
    ),
  }),
  education: dir({
    "vips-tc.md": file(`${education[0].degree}\n${education[0].school}\n${education[0].period}  |  ${education[0].score}`),
    "dseu.md": file(`${education[1].degree}\n${education[1].school}\n${education[1].period}  |  ${education[1].score}`),
  }),
  certs: dir(
    Object.fromEntries(
      certifications.map((c) => [
        c.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, "") + ".txt",
        file(`${c.name}\nissuer: ${c.issuer}\nverify: ${c.url}` + (c.scoreReport ? `\nscore:  ${c.scoreReport}` : "")),
      ]),
    ),
  ),
  "publications.txt": file(publications.map((p) => `[${p.type}] ${p.title}`).join("\n")),
});

let cwd: string[] = [];

export const getCwd = () => (cwd.length ? "~/" + cwd.join("/") : "~");

export function resolve(path = ""): { node: Node | null; parts: string[] } {
  let parts = path.startsWith("~") || path.startsWith("/") ? [] : [...cwd];
  for (const seg of path.replace(/^~\/?|^\//, "").split("/").filter(Boolean)) {
    if (seg === ".") continue;
    if (seg === "..") parts.pop();
    else parts.push(seg);
  }
  let node: Node | null = root;
  for (const p of parts) {
    node = node && node.type === "dir" ? node.children[p] ?? null : null;
  }
  return { node, parts };
}

export function cd(path?: string): string | null {
  if (!path || path === "~") { cwd = []; return null; }
  const { node, parts } = resolve(path);
  if (!node) return `cd: no such directory: ${path}`;
  if (node.type !== "dir") return `cd: not a directory: ${path}`;
  cwd = parts;
  return null;
}

// names in a directory, for tab completion of paths
export function completePath(partial: string): string[] {
  const slash = partial.lastIndexOf("/");
  const base = slash >= 0 ? partial.slice(0, slash + 1) : "";
  const stem = slash >= 0 ? partial.slice(slash + 1) : partial;
  const { node } = resolve(base || ".");
  if (!node || node.type !== "dir") return [];
  return Object.entries(node.children)
    .filter(([n]) => n.startsWith(stem))
    .map(([n, c]) => base + n + (c.type === "dir" ? "/" : ""));
}
