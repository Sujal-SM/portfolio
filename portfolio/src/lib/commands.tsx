import { useEffect, useState, type ReactNode } from "react";
import { ask } from "./ask";
import { verifyCertificate } from "../components/HoloCert";
import { internshipCertificate } from "../data/resume";
import {
  certifications, education, experience, profile, projects, publications, RESUME_URL, sections, skills,
} from "../data/resume";
import { scrollToSection } from "../hooks/useActiveSection";
import { emit, openProject, selectSkill, viewDoc } from "./bus";
import { cd, completePath, getCwd, resolve } from "./fs";
import { ACCENTS, cycleAccent, setAccent, type Accent } from "./theme";
import { setSound, soundOn } from "./sound";
import { DemoStatus } from "../components/DemoStatus";

export type CommandResult = ReactNode | { clear: true };

type Command = { desc: string; usage?: string; run: (args: string[]) => CommandResult };

const A = ({ href, children }: { href: string; children: ReactNode }) => (
  <a
    href={href}
    target={href.startsWith("http") ? "_blank" : undefined}
    rel="noreferrer"
    className="text-phos underline decoration-phos-dim underline-offset-2 hover:decoration-phos"
  >
    {children}
  </a>
);

const Key = ({ children }: { children: ReactNode }) => <span className="text-phos">{children}</span>;
const Dim = ({ children }: { children: ReactNode }) => <span className="text-dim">{children}</span>;

function AskAnswer({ q }: { q: string }) {
  const [a, setA] = useState<{ answer: string; source: "ai" | "local" } | null>(null);
  useEffect(() => { let live = true; void ask(q).then((r) => live && setA(r)); return () => { live = false; }; }, [q]);
  if (!a) return <Dim>thinking<span className="cursor-block ml-1" /></Dim>;
  return (
    <div>
      <p className="whitespace-pre-wrap">{a.answer}</p>
      <p className="mt-1 text-faint">{a.source === "ai" ? "answered by AI from the resume" : "matched from the resume text (AI chat runs on the deployed site)"}</p>
    </div>
  );
}

function Verify() {
  const [r, setR] = useState<{ sha: string; bytes: number } | string | null>(null);
  useEffect(() => { verifyCertificate().then(setR).catch((e: Error) => setR(e.message)); }, []);
  const C = internshipCertificate;
  if (!r) return <Dim>hashing {C.pdf}...</Dim>;
  if (typeof r === "string") return <span className="text-amber">verify: {r}</span>;
  return (
    <div className="grid grid-cols-[auto_1fr] gap-x-4">
      <Key>file</Key><span>{C.pdf} ({Math.round(r.bytes / 1024)} KB)</span>
      <Key>sha256</Key><span className="break-all">{r.sha}</span>
      <Key>issuer</Key><span>{C.company}, signed by {C.signedBy} ({C.signerTitle})</span>
      <Key>period</Key><span>{C.startLabel} to {C.endLabel}, {C.duration}</span>
      <span className="col-span-2 mt-1"><button type="button" onClick={() => viewDoc(`${C.title}: ${C.company}`, C.pdf, C.image)} className="text-phos underline underline-offset-2">open certificate</button></span>
    </div>
  );
}

function DemoChecks() {
  const live = projects.filter((p) => p.demo);
  return (
    <div className="space-y-1">
      {live.map((p) => (
        <div key={p.slug}><Key>{p.name}</Key><DemoStatus url={p.demo!} /></div>
      ))}
    </div>
  );
}

// turn URLs and emails inside file contents into links
function linkify(text: string) {
  return text.split(/(https?:\/\/\S+|[\w.+-]+@[\w-]+\.[\w.]+)/g).map((part, i) =>
    /^https?:\/\//.test(part) ? <A key={i} href={part}>{part}</A> : /@/.test(part) && /\.\w/.test(part) ? <A key={i} href={`mailto:${part}`}>{part}</A> : part,
  );
}

const sectionIds = sections.map((s) => s.id) as string[];

export const commands: Record<string, Command> = {
  help: {
    desc: "list available commands",
    run: () => (
      <div className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-0.5">
        {Object.entries(commands).map(([name, c]) => (
          <div key={name} className="contents">
            <Key>{c.usage ?? name}</Key>
            <Dim>{c.desc}</Dim>
          </div>
        ))}
        <span className="col-span-2 mt-2 text-faint">tip: tab completes, up/down walks history, ctrl+l clears</span>
      </div>
    ),
  },
  about: {
    desc: "who I am",
    run: () => (
      <div className="space-y-1">
        <p><Key>{profile.name}</Key> <Dim>/ {profile.role}</Dim></p>
        <p>{profile.intro}</p>
        <p><Dim>currently:</Dim> {education[0].degree.replace("Bachelor of Technology (B.Tech)", "B.Tech")}, {education[0].period}</p>
      </div>
    ),
  },
  whoami: { desc: "print the user", run: () => `${profile.handle}  (${profile.name}, ${profile.role})` },
  projects: {
    desc: "list projects with links",
    run: () => (
      <ul className="space-y-2">
        {projects.map((p) => (
          <li key={p.slug}>
            <button type="button" onClick={() => openProject(p.slug)} className="text-phos underline decoration-phos-dim underline-offset-2 hover:decoration-phos">{p.name}</button>
            <p className="text-dim">{p.summary}</p>
            <p className="text-faint">{p.stack.slice(0, 6).join(", ")}{p.stack.length > 6 ? ", ..." : ""}</p>
            <p className="space-x-3">
              {p.repo && <A href={p.repo}>repo</A>}
              {p.demo && <A href={p.demo}>live demo</A>}
            </p>
          </li>
        ))}
      </ul>
    ),
  },
  skills: {
    desc: "show the toolbox",
    run: () => (
      <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-[auto_1fr]">
        {skills.map((s) => (
          <div key={s.group} className="contents">
            <Key>{s.group}/</Key>
            <Dim>{s.items.join(", ")}</Dim>
          </div>
        ))}
      </div>
    ),
  },
  experience: {
    desc: "work history",
    run: () => (
      <div className="space-y-2">
        {experience.map((e) => (
          <div key={e.company}>
            <p><Key>{e.role}</Key> @ {e.company} <Dim>({e.period})</Dim></p>
            <ul className="mt-1 space-y-0.5 text-dim">
              {e.points.map((pt) => <li key={pt}>- {pt}</li>)}
            </ul>
          </div>
        ))}
      </div>
    ),
  },
  education: {
    desc: "academic record",
    run: () => (
      <div className="space-y-1.5">
        {education.map((e) => (
          <div key={e.school}>
            <p><Key>{e.degree}</Key></p>
            <p className="text-dim">{e.school} <span className="text-faint">| {e.period} | {e.score}</span></p>
          </div>
        ))}
      </div>
    ),
  },
  certs: {
    desc: "certifications and publications",
    run: () => (
      <div className="space-y-1">
        {certifications.map((c) => (
          <p key={c.name}>
            <Key>[ok]</Key> {c.name} <Dim>({c.issuer})</Dim> <A href={c.url}>verify</A>
            {c.scoreReport && <> <A href={c.scoreReport}>score</A></>}
          </p>
        ))}
        {publications.map((p) => (
          <p key={p.title}><Key>[paper]</Key> <Dim>{p.title}</Dim></p>
        ))}
      </div>
    ),
  },
  contact: {
    desc: "ways to reach me",
    run: () => (
      <div className="grid grid-cols-[auto_1fr] gap-x-6">
        <Dim>email</Dim><A href={`mailto:${profile.email}`}>{profile.email}</A>
        <Dim>phone</Dim><A href={profile.phoneHref}>{profile.phone}</A>
        <Dim>github</Dim><A href={profile.github.url}>github.com/{profile.github.label}</A>
        <Dim>linkedin</Dim><A href={profile.linkedin.url}>{profile.linkedin.label}</A>
      </div>
    ),
  },
  resume: { desc: "open my resume (PDF)", run: () => (RESUME_URL ? <>resume.pdf ready: <A href={RESUME_URL}>open</A></> : <Dim>resume is available on request: {profile.email}</Dim>) },
  goto: {
    desc: "scroll to a section",
    usage: "goto <section>",
    run: ([target]) => {
      if (!target) return <Dim>usage: goto {"<"}{sectionIds.join("|")}{">"}</Dim>;
      if (!sectionIds.includes(target)) return <span className="text-amber">goto: no section named "{target}". try: {sectionIds.join(", ")}</span>;
      setTimeout(() => scrollToSection(target), 60);
      return <Dim>jumping to #{target}</Dim>;
    },
  },
  replay: {
    desc: "watch the deploy replay",
    run: () => {
      setTimeout(() => scrollToSection("replay"), 60);
      return <Dim>rolling the replay</Dim>;
    },
  },
  open: {
    desc: "expand a project on the page",
    usage: "open <project>",
    run: ([slug]) => {
      const p = projects.find((x) => x.slug === slug || x.slug.startsWith(slug ?? "-"));
      if (!p) return <Dim>usage: open {"<"}{projects.map((x) => x.slug).join("|")}{">"}</Dim>;
      openProject(p.slug);
      return <Dim>opening {p.name}</Dim>;
    },
  },
  grep: {
    desc: "find where a skill is used",
    usage: "grep <skill>",
    run: (args) => {
      if (!args.length) return <Dim>usage: grep docker</Dim>;
      selectSkill(args.join(" "));
      return <Dim>searching skills for "{args.join(" ")}"</Dim>;
    },
  },
  palette: { desc: "open the command palette (ctrl+k)", run: () => { emit("open-palette"); return <Dim>opened</Dim>; } },
  ls: {
    desc: "list files",
    usage: "ls [dir]",
    run: ([path]) => {
      const { node } = resolve(path ?? "");
      if (!node) return <span className="text-amber">ls: no such file or directory: {path}</span>;
      if (node.type === "file") return path;
      return (
        <div className="flex flex-wrap gap-x-5">
          {Object.entries(node.children).map(([n, c]) => (
            <span key={n} className={c.type === "dir" ? "text-phos" : "text-fg"}>{n}{c.type === "dir" ? "/" : ""}</span>
          ))}
        </div>
      );
    },
  },
  cd: {
    desc: "change directory",
    usage: "cd <dir>",
    run: ([path]) => {
      const err = cd(path);
      return err ? <span className="text-amber">{err}</span> : null;
    },
  },
  pwd: { desc: "print working directory", run: () => getCwd().replace("~", `/home/${profile.handle}`) },
  cat: {
    desc: "print a file",
    usage: "cat <file>",
    run: ([path]) => {
      if (!path) return <Dim>usage: cat about.txt  (try ls first)</Dim>;
      const { node } = resolve(path);
      if (!node) return <span className="text-amber">cat: {path}: no such file</span>;
      if (node.type === "dir") return <span className="text-amber">cat: {path}: is a directory (try ls {path})</span>;
      return <pre className="whitespace-pre-wrap font-mono">{linkify(node.content)}</pre>;
    },
  },
  fetch: {
    desc: "system info, neofetch style",
    run: () => (
      <div className="flex flex-wrap gap-x-6 gap-y-2">
        <pre className="text-phos leading-tight" aria-hidden="true">{` .------.\n | >_   |\n | ---- |\n '------'\n   _||_`}</pre>
        <div className="grid grid-cols-[auto_1fr] gap-x-4">
          <Key>user</Key><span>{profile.name}</span>
          <Key>role</Key><span>{profile.role}</span>
          <Key>study</Key><span>B.Tech CSE, VIPS-TC ({education[0].score})</span>
          <Key>last job</Key><span>{experience[0].role}, {experience[0].company}</span>
          <Key>clouds</Key><span>AWS, OCI</span>
          <Key>projects</Key><span>{projects.length}</span>
          <Key>certs</Key><span>{certifications.length}</span>
        </div>
      </div>
    ),
  },
  theme: {
    desc: "switch accent color",
    usage: "theme [sage|amber|ice|mono]",
    run: ([name]) => {
      if (!name) return <Dim>now: {cycleAccent()}  (themes: {ACCENTS.join(", ")})</Dim>;
      if (!ACCENTS.includes(name as Accent)) return <span className="text-amber">theme: pick one of {ACCENTS.join(", ")}</span>;
      setAccent(name as Accent);
      return <Dim>accent set to {name}</Dim>;
    },
  },
  ask: {
    desc: "ask anything about Sujal",
    usage: "ask <question>",
    run: (args) => (args.length ? <AskAnswer q={args.join(" ")} /> : <Dim>usage: ask what did you do at Global Trend?</Dim>),
  },
  verify: { desc: "hash the internship certificate PDF", run: () => <Verify /> },
  snake: { desc: "play snake", run: () => { emit("open-game", "snake"); return <Dim>good luck</Dim>; } },
  typetest: { desc: "kubectl typing speed test", run: () => { emit("open-game", "type"); return <Dim>30 seconds, go</Dim>; } },
  reboot: { desc: "replay the boot screen", run: () => { emit("reboot"); return null; } },
  sound: {
    desc: "key sounds on or off",
    usage: "sound [on|off]",
    run: ([v]) => { const on = v ? v === "on" : !soundOn(); setSound(on); return <Dim>key sounds {on ? "on" : "off"}</Dim>; },
  },
  status: {
    desc: "check if the live demos are up",
    run: () => <DemoChecks />,
  },
  stars: { desc: "meteor shower", run: () => { window.dispatchEvent(new Event("meteor-shower")); return <Dim>look up ✦</Dim>; } },
  date: { desc: "print local time", run: () => new Date().toString() },
  echo: { desc: "print text", usage: "echo <text>", run: (args) => args.join(" ") },
  clear: { desc: "clear the screen", run: () => ({ clear: true }) },
};

export const commandNames = Object.keys(commands);

export function runCommand(raw: string): CommandResult {
  const [name, ...args] = raw.trim().split(/\s+/);
  if (!name) return null;
  const cmd = commands[name.toLowerCase()];
  if (cmd) return cmd.run(args);
  if (name === "sudo") {
    if (args.join(" ").toLowerCase() === "hire sujal") {
      window.dispatchEvent(new Event("meteor-shower"));
      setTimeout(() => scrollToSection("contact"), 1400);
      return <span className="text-phos">permission granted. opening contact...</span>;
    }
    return <span className="text-amber">nice try. this incident will be reported. (psst: sudo hire sujal)</span>;
  }
  return (
    <span>
      <span className="text-amber">command not found: {name}</span> <Dim>type</Dim> <Key>help</Key> <Dim>to see what works</Dim>
    </span>
  );
}

export function complete(partial: string): string[] {
  const parts = partial.split(/\s+/);
  if (parts.length === 2 && ["cd", "cat", "ls"].includes(parts[0])) {
    return completePath(parts[1]).map((p) => `${parts[0]} ${p}`);
  }
  if (parts.length === 2 && parts[0] === "theme") {
    return ACCENTS.filter((a) => a.startsWith(parts[1])).map((a) => `theme ${a}`);
  }
  if (parts.length === 2 && parts[0] === "open") {
    return projects.map((p) => p.slug).filter((s) => s.startsWith(parts[1])).map((s) => `open ${s}`);
  }
  if (parts.length === 2 && parts[0] === "goto") {
    return sectionIds.filter((s) => s.startsWith(parts[1])).map((s) => `goto ${s}`);
  }
  return commandNames.filter((c) => c.startsWith(partial.toLowerCase()));
}
