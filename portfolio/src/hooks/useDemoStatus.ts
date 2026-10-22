import { useCallback, useEffect, useState } from "react";

export type DemoStatus = "idle" | "checking" | "up" | "slow" | "down";

// Render's free tier sleeps. A no-cors request is enough to tell "answers" from "doesn't",
// and it also wakes the app up. We can't read the response, only whether one came back.
export function useDemoStatus(url?: string, auto = true) {
  const [status, setStatus] = useState<DemoStatus>("idle");
  const [ms, setMs] = useState<number | null>(null);

  const check = useCallback(async () => {
    if (!url) return;
    setStatus("checking");
    const t0 = performance.now();
    const slow = setTimeout(() => setStatus("slow"), 4000);
    const ctrl = new AbortController();
    const kill = setTimeout(() => ctrl.abort(), 60_000);
    try {
      await fetch(url, { mode: "no-cors", cache: "no-store", signal: ctrl.signal });
      setMs(Math.round(performance.now() - t0));
      setStatus("up");
    } catch {
      setStatus("down");
    } finally {
      clearTimeout(slow);
      clearTimeout(kill);
    }
  }, [url]);

  useEffect(() => { if (auto && url) void check(); }, [auto, url, check]);
  return { status, ms, check };
}
