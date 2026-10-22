import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { profile } from "../data/resume";

// Live data from the public GitHub API (no token, 60 requests/hour per visitor IP).
// Cached for 30 minutes in sessionStorage so navigating around doesn't burn the limit.
type Repo = {
  name: string; description: string | null; language: string | null; stargazers_count: number;
  forks_count: number; html_url: string; pushed_at: string; fork: boolean;
};
type Push = { repo: string; message: string; sha: string; at: string };
type Data = { repos: Repo[]; pushes: Push[]; at: number };

const USER = profile.github.label;
const CACHE = `gh-${USER}`;

async function load(): Promise<Data> {
  try {
    const c = JSON.parse(sessionStorage.getItem(CACHE) || "null") as Data | null;
    if (c && Date.now() - c.at < 30 * 60_000) return c;
  } catch { /* ignore */ }
  const [r, e] = await Promise.all([
    fetch(`https://api.github.com/users/${USER}/repos?sort=pushed&per_page=100`),
    fetch(`https://api.github.com/users/${USER}/events/public?per_page=40`),
  ]);
  if (!r.ok) throw new Error(r.status === 403 ? "rate" : `http ${r.status}`);
  const repos = ((await r.json()) as Repo[]).filter((x) => !x.fork);
  type Ev = { type: string; repo: { name: string }; created_at: string; payload: { commits?: { message: string; sha: string }[]; ref?: string; head?: string } };
  const events = e.ok ? ((await e.json()) as Ev[]) : [];
  // some API versions drop commit details from push events; fall back to the branch + head sha
  const pushes: Push[] = events
    .filter((ev) => ev.type === "PushEvent")
    .flatMap((ev) => {
      const repo = ev.repo.name.split("/")[1];
      const commits = ev.payload.commits ?? [];
      if (commits.length) return commits.map((c) => ({ repo, message: c.message.split("\n")[0], sha: c.sha.slice(0, 7), at: ev.created_at }));
      return [{ repo, message: `pushed to ${(ev.payload.ref ?? "").replace("refs/heads/", "") || "a branch"}`, sha: (ev.payload.head ?? ev.created_at).slice(0, 7), at: ev.created_at }];
    })
    .slice(0, 6);
  const data = { repos, pushes, at: Date.now() };
  try { sessionStorage.setItem(CACHE, JSON.stringify(data)); } catch { /* ignore */ }
  return data;
}

function ago(iso: string) {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 3600) return `${Math.max(1, Math.round(s / 60))}m ago`;
  if (s < 86400) return `${Math.round(s / 3600)}h ago`;
  if (s < 86400 * 30) return `${Math.round(s / 86400)}d ago`;
  return new Date(iso).toLocaleDateString("en-IN", { month: "short", year: "numeric" });
}

export function GitHubPanel() {
  const [data, setData] = useState<Data | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  // load only when the panel scrolls near the viewport
  useEffect(() => {
    const el = document.getElementById("github-live");
    if (!el) return;
    const o = new IntersectionObserver(([x]) => { if (x.isIntersecting) { setVisible(true); o.disconnect(); } }, { rootMargin: "300px" });
    o.observe(el);
    return () => o.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    load().then(setData).catch((e: Error) => setErr(e.message));
  }, [visible]);

  const langs = (() => {
    if (!data) return [];
    const m = new Map<string, number>();
    data.repos.forEach((r) => r.language && m.set(r.language, (m.get(r.language) ?? 0) + 1));
    const total = [...m.values()].reduce((a, b) => a + b, 0) || 1;
    return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([l, n]) => ({ l, pct: Math.round((n / total) * 100) }));
  })();
  const stars = data?.repos.reduce((n, r) => n + r.stargazers_count, 0) ?? 0;

  return (
    <div id="github-live" className="mt-16">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h3 className="text-xl font-semibold text-fg">Live from GitHub</h3>
        <a href={profile.github.url} target="_blank" rel="noreferrer" className="font-mono text-sm text-phos underline decoration-phos-dim underline-offset-4">github.com/{USER}</a>
      </div>

      {!data && !err && (
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="Loading GitHub data">
          {[0, 1, 2].map((i) => <div key={i} className="h-28 animate-pulse rounded-md border border-line bg-panel" />)}
        </div>
      )}

      {err && (
        <p className="mt-6 rounded-md border border-line bg-panel p-5 font-mono text-sm text-dim">
          {err === "rate"
            ? "GitHub's hourly limit for this network is used up, so live data can't load right now."
            : "GitHub didn't respond, so live data can't load right now."}{" "}
          The repos are all on <a className="text-phos underline underline-offset-4" href={profile.github.url} target="_blank" rel="noreferrer">GitHub</a>.
        </p>
      )}

      {data && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 grid gap-6 lg:grid-cols-[1fr_18rem]">
          <ul className="grid gap-3 sm:grid-cols-2">
            {data.repos.slice(0, 6).map((r) => (
              <li key={r.name}>
                <a href={r.html_url} target="_blank" rel="noreferrer" className="block h-full rounded-md border border-line bg-panel p-4 transition-colors hover:border-phos-dim">
                  <p className="truncate font-mono text-sm text-phos">{r.name}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-dim">{r.description ?? "No description on GitHub."}</p>
                  <p className="mt-3 flex flex-wrap gap-x-4 font-mono text-xs text-faint">
                    {r.language && <span>{r.language}</span>}
                    <span>★ {r.stargazers_count}</span>
                    <span>pushed {ago(r.pushed_at)}</span>
                  </p>
                </a>
              </li>
            ))}
          </ul>
          <aside className="space-y-6 font-mono text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-md border border-line bg-panel p-3"><p className="text-xl text-phos">{data.repos.length}</p><p className="text-xs text-faint">public repos</p></div>
              <div className="rounded-md border border-line bg-panel p-3"><p className="text-xl text-phos">{stars}</p><p className="text-xs text-faint">stars</p></div>
            </div>
            {langs.length > 0 && (
              <div>
                <p className="text-xs text-faint">languages by repo</p>
                <div className="mt-2 flex h-2 overflow-hidden rounded-full bg-line">
                  {langs.map((x, i) => <span key={x.l} style={{ width: `${x.pct}%`, opacity: 1 - i * 0.14 }} className="bg-phos" />)}
                </div>
                <ul className="mt-2 space-y-0.5 text-xs">
                  {langs.map((x) => <li key={x.l} className="flex justify-between text-dim"><span>{x.l}</span><span className="text-faint">{x.pct}%</span></li>)}
                </ul>
              </div>
            )}
            {data.pushes.length > 0 && (
              <div>
                <p className="text-xs text-faint">recent commits</p>
                <ul className="mt-2 space-y-2 text-xs">
                  {data.pushes.map((p) => (
                    <li key={p.sha}>
                      <span className="text-phos">{p.sha}</span> <span className="text-fg">{p.message}</span>
                      <span className="block text-faint">{p.repo}, {ago(p.at)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </motion.div>
      )}
    </div>
  );
}
