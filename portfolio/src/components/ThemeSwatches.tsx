import { useEffect, useState } from "react";
import { ACCENTS, getAccent, setAccent, type Accent } from "../lib/theme";

const SWATCH: Record<Accent, string> = { sage: "#7fb894", amber: "#d6b06f", ice: "#8fb6d8", mono: "#c9cfcb" };

export function ThemeSwatches() {
  const [cur, setCur] = useState<Accent>(getAccent);
  useEffect(() => {
    const h = (e: Event) => setCur((e as CustomEvent).detail);
    addEventListener("accent-change", h);
    return () => removeEventListener("accent-change", h);
  }, []);
  return (
    <div className="flex items-center gap-2" role="group" aria-label="Accent color">
      <span>accent</span>
      {ACCENTS.map((a) => (
        <button
          key={a}
          type="button"
          onClick={() => setAccent(a)}
          aria-pressed={cur === a}
          aria-label={`${a} accent`}
          title={a}
          className={`size-4 rounded-full border-2 transition-transform hover:scale-110 ${cur === a ? "border-fg" : "border-transparent"}`}
          style={{ background: SWATCH[a] }}
        />
      ))}
    </div>
  );
}
