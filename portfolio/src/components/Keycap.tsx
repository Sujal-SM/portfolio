import { useEffect, useState, type ReactNode } from "react";
import { click } from "../lib/sound";

type Props = {
  legend: ReactNode;          // main label
  sub?: ReactNode;            // small top-left label
  onPress?: () => void;
  match?: (e: KeyboardEvent) => boolean; // light up when the real key is pressed
  label: string;              // accessible name
  size?: "sm" | "md" | "lg";
  wide?: boolean;
  active?: boolean;
};

const SIZES = {
  sm: "h-9 min-w-9 px-2 text-xs",
  md: "h-12 min-w-12 px-3 text-sm",
  lg: "h-[76px] min-w-[76px] px-3 text-xl",
};

// A 3D keycap: real depth, presses down on click, tap, Enter/Space,
// and when the matching physical key is pressed anywhere on the page.
export function Keycap({ legend, sub, onPress, match, label, size = "md", wide, active }: Props) {
  const [down, setDown] = useState(false);

  useEffect(() => {
    if (!match) return;
    const d = (e: KeyboardEvent) => { if (match(e) && !e.repeat) { setDown(true); click("cap"); } };
    const u = () => setDown(false);
    addEventListener("keydown", d);
    addEventListener("keyup", u);
    addEventListener("blur", u);
    return () => {
      removeEventListener("keydown", d);
      removeEventListener("keyup", u);
      removeEventListener("blur", u);
    };
  }, [match]);

  const pressed = down || active;

  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      onPointerDown={() => { setDown(true); click("cap"); }}
      onPointerUp={() => setDown(false)}
      onPointerLeave={() => setDown(false)}
      onClick={onPress}
      className={`keycap group relative inline-flex shrink-0 select-none flex-col justify-end rounded-[10px] text-left font-mono font-semibold ${
        SIZES[size]
      } ${wide ? "min-w-24" : ""} ${pressed ? "keycap-down" : ""}`}
    >
      {sub && <span className="absolute left-2 top-1.5 text-[0.62em] font-medium leading-none text-dim">{sub}</span>}
      <span className={`relative pb-[0.45em] leading-none transition-colors ${active ? "text-fg" : "text-phos group-hover:brightness-125"}`}>{legend}</span>
    </button>
  );
}
