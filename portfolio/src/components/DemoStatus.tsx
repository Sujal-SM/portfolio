import { useDemoStatus } from "../hooks/useDemoStatus";

const TEXT = {
  idle: "not checked",
  checking: "checking...",
  slow: "waking up (Render free tier sleeps, give it up to a minute)",
  up: "online",
  down: "not reachable right now",
};

export function DemoStatus({ url }: { url: string }) {
  const { status, ms, check } = useDemoStatus(url);
  const color =
    status === "up" ? "bg-phos" : status === "down" ? "bg-[#c86b5e]" : status === "slow" || status === "checking" ? "bg-amber animate-pulse" : "bg-line";
  return (
    <div className="flex flex-wrap items-center gap-2 font-mono text-xs" aria-live="polite">
      <span className={`size-2 rounded-full ${color}`} aria-hidden="true" />
      <span className="text-dim">live demo: {TEXT[status]}{status === "up" && ms ? ` (${ms} ms)` : ""}</span>
      {(status === "down" || status === "up" || status === "idle") && (
        <button type="button" onClick={() => void check()} className="text-faint underline underline-offset-4 hover:text-phos">
          {status === "down" ? "wake it up" : "check again"}
        </button>
      )}
    </div>
  );
}
