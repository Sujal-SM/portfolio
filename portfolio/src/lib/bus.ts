import { scrollToSection } from "../hooks/useActiveSection";

// Tiny cross-component event bus (palette, terminal, chips all trigger the same actions).
type Events = {
  "open-project": string; "select-skill": string; "open-palette": void; "open-shortcuts": void;
  "view-doc": { title: string; url: string; image?: string }; "open-game": "snake" | "type"; "reboot": void;
};

export function emit<K extends keyof Events>(name: K, detail?: Events[K]) {
  window.dispatchEvent(new CustomEvent(name, { detail }));
}
export function on<K extends keyof Events>(name: K, fn: (d: Events[K]) => void) {
  const h = (e: Event) => fn((e as CustomEvent).detail);
  window.addEventListener(name, h);
  return () => window.removeEventListener(name, h);
}

export function openProject(slug: string) {
  emit("open-project", slug);
  setTimeout(() => {
    const el = document.getElementById(`proj-${slug}`);
    el?.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
  }, 80);
}

export function selectSkill(skill: string) {
  emit("select-skill", skill);
  setTimeout(() => scrollToSection("skills"), 40);
}

// Google Drive share links -> embeddable preview links
export function drivePreview(url: string) {
  const m = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  return m ? `https://drive.google.com/file/d/${m[1]}/preview` : url;
}

export function viewDoc(title: string, url: string, image?: string) {
  emit("view-doc", { title, url, image });
}

// Drive's public thumbnail endpoint (works for files shared with "anyone with the link")
export function driveThumb(url: string, width = 800) {
  const m = url.match(/drive\.google\.com\/file\/d\/([^/?]+)/);
  return m ? `https://drive.google.com/thumbnail?id=${m[1]}&sz=w${width}` : null;
}
