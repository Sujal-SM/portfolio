import { useEffect, useState } from "react";
import { setSound, soundOn } from "../lib/sound";

export function SoundToggle({ compact }: { compact?: boolean }) {
  const [on, setOn] = useState(soundOn);
  useEffect(() => {
    const h = (e: Event) => setOn((e as CustomEvent).detail);
    addEventListener("sound-change", h);
    return () => removeEventListener("sound-change", h);
  }, []);
  return (
    <button
      type="button"
      onClick={() => setSound(!on)}
      aria-pressed={on}
      aria-label={on ? "Turn key sounds off" : "Turn key sounds on"}
      title="key sounds (m)"
      className="shrink-0 rounded border border-line px-2 py-1 text-dim transition-colors hover:border-phos-dim hover:text-phos"
    >
      {compact ? (on ? "♪ on" : "♪ off") : on ? "sound on" : "sound off"}
    </button>
  );
}
