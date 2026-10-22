export const ACCENTS = ["sage", "amber", "ice", "mono"] as const;
export type Accent = (typeof ACCENTS)[number];

const KEY = "sujal-accent";

export function getAccent(): Accent {
  const a = document.documentElement.dataset.accent as Accent | undefined;
  return a && ACCENTS.includes(a) ? a : "sage";
}

export function setAccent(a: Accent) {
  if (a === "sage") delete document.documentElement.dataset.accent;
  else document.documentElement.dataset.accent = a;
  try { localStorage.setItem(KEY, a); } catch { /* storage unavailable */ }
  window.dispatchEvent(new CustomEvent("accent-change", { detail: a }));
}

export function cycleAccent() {
  const i = ACCENTS.indexOf(getAccent());
  const next = ACCENTS[(i + 1) % ACCENTS.length];
  setAccent(next);
  return next;
}

export function restoreAccent() {
  try {
    const a = localStorage.getItem(KEY) as Accent | null;
    if (a && ACCENTS.includes(a)) setAccent(a);
  } catch { /* ignore */ }
}

export function accentRGB(): string {
  return getComputedStyle(document.documentElement).getPropertyValue("--phos-rgb").trim() || "127, 184, 148";
}
