import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { createPortal } from "react-dom";
import { complete, runCommand } from "../lib/commands";
import { getCwd } from "../lib/fs";
import { click } from "../lib/sound";
import { profile } from "../data/resume";

type Line = { id: number; input?: string; cwd?: string; output?: ReactNode };
type WinState = "normal" | "min" | "max" | "closed";

const PROMPT = `${profile.handle}@workspace`;
const QUICK = ["help", "ask what certs does he have?", "ls", "fetch", "snake", "typetest", "stars", "sudo hire sujal", "clear"];

const bootLines: ReactNode[] = [
  <span className="text-dim">booting workspace ... <span className="text-phos">ok</span></span>,
  <span className="text-dim">mounting ~/projects ~/certs ~/experience ... <span className="text-phos">ok</span></span>,
  <span>
    Welcome. Type <span className="text-phos">help</span> to see commands, or tap one below.
  </span>,
];

let uid = 0;

export function Terminal() {
  const reduce = useReducedMotion();
  const [lines, setLines] = useState<Line[]>([]);
  const [booted, setBooted] = useState(false);
  const [value, setValue] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [hIndex, setHIndex] = useState(-1);
  const [hint, setHint] = useState("");
  const [win, setWin] = useState<WinState>("normal");
  const [cwd, setCwd] = useState("~");
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // boot sequence: the one orchestrated load moment on the page
  useEffect(() => {
    if (reduce) {
      setLines(bootLines.map((o) => ({ id: uid++, output: o })));
      setBooted(true);
      return;
    }
    const timers = bootLines.map((o, i) =>
      setTimeout(() => {
        setLines((l) => [...l, { id: uid++, output: o }]);
        if (i === bootLines.length - 1) setBooted(true);
      }, 350 + i * 420),
    );
    return () => timers.forEach(clearTimeout);
  }, [reduce]);

  useEffect(() => {
    if (win !== "max") return;
    const k = (e: globalThis.KeyboardEvent) => { if (e.key === "Escape") setWin("normal"); };
    addEventListener("keydown", k);
    document.body.style.overflow = "hidden";
    return () => { removeEventListener("keydown", k); document.body.style.overflow = ""; };
  }, [win]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

  function execute(raw: string) {
    const cmd = raw.trim();
    setHint("");
    setHIndex(-1);
    if (!cmd) {
      setLines((l) => [...l, { id: uid++, input: "", cwd }]);
      return;
    }
    setHistory((h) => [...h, cmd]);
    const result = runCommand(cmd);
    if (result && typeof result === "object" && "clear" in (result as object)) {
      setLines([]);
      return;
    }
    setLines((l) => [...l, { id: uid++, input: cmd, cwd, output: result as ReactNode }]);
    setCwd(getCwd());
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (!e.repeat && (e.key.length === 1 || e.key === "Backspace")) click("key");
    if (e.key === "Enter") click("enter");
    if (e.key === "Enter") {
      execute(value);
      setValue("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!history.length) return;
      const next = hIndex < 0 ? history.length - 1 : Math.max(0, hIndex - 1);
      setHIndex(next);
      setValue(history[next]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (hIndex < 0) return;
      const next = hIndex + 1;
      if (next >= history.length) {
        setHIndex(-1);
        setValue("");
      } else {
        setHIndex(next);
        setValue(history[next]);
      }
    } else if (e.key === "Tab") {
      if (!value) return; // let Tab move focus when empty
      e.preventDefault();
      const matches = complete(value);
      if (matches.length === 1) {
        setValue(matches[0] + " ");
        setHint("");
      } else if (matches.length > 1) setHint(matches.join("  "));
    } else if (e.key.toLowerCase() === "l" && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
    }
  }

  if (win === "closed") {
    return (
      <div className="grid h-[440px] place-items-center rounded-md border border-dashed border-line sm:h-[480px]">
        <div className="text-center font-mono text-sm text-dim">
          <p>[process exited]</p>
          <button
            type="button"
            onClick={() => { setWin("normal"); setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 50); }}
            className="mt-3 rounded border border-line px-3 py-1.5 text-phos hover:border-phos-dim"
          >
            reopen terminal
          </button>
        </div>
      </div>
    );
  }

  const shell = win === "max"
    ? "fixed inset-3 z-[65] h-auto sm:inset-8"
    : win === "min" ? "h-auto" : "h-[440px] sm:h-[480px]";

  const view = (
    <>
    {win === "max" && <div className="fixed inset-0 z-[64] bg-black/75 backdrop-blur-sm" onClick={() => setWin("normal")} aria-hidden="true" />}
    <motion.div
      layout={!reduce}
      transition={{ type: "spring", stiffness: 380, damping: 34 }}
      className={`flex flex-col overflow-hidden rounded-md border border-line bg-panel shadow-[0_0_0_1px_rgba(var(--phos-rgb),0.018),0_30px_80px_-30px_rgba(var(--phos-rgb),0.081)] ${shell}`}
      onClick={() => {
        if (!window.getSelection()?.toString()) inputRef.current?.focus({ preventScroll: true });
      }}
    >
      <div className="flex items-center gap-3 border-b border-line bg-panel-2 px-4 py-2.5">
        <div className="group/dots flex gap-1.5">
          <button type="button" aria-label="Close terminal" onClick={(e) => { e.stopPropagation(); setWin("closed"); }} className="grid size-3 place-items-center rounded-full bg-line text-[8px] leading-none text-transparent transition-colors hover:bg-[#c86b5e] hover:text-black/70">×</button>
          <button type="button" aria-label={win === "min" ? "Restore terminal" : "Minimize terminal"} onClick={(e) => { e.stopPropagation(); setWin(win === "min" ? "normal" : "min"); }} className="grid size-3 place-items-center rounded-full bg-line text-[8px] leading-none text-transparent transition-colors hover:bg-[#d6b06f] hover:text-black/70">–</button>
          <button type="button" aria-label={win === "max" ? "Exit full screen" : "Full screen terminal"} onClick={(e) => { e.stopPropagation(); setWin(win === "max" ? "normal" : "max"); }} className="grid size-3 place-items-center rounded-full bg-phos-dim text-[8px] leading-none text-transparent transition-colors hover:bg-phos hover:text-black/70">+</button>
        </div>
        <p className="truncate font-mono text-xs text-dim">{PROMPT}: {cwd} (zsh){win === "max" ? "  esc to exit" : ""}</p>
      </div>

      {win !== "min" && (
      <>
      <div
        ref={scrollRef}
        role="log"
        aria-live="polite"
        aria-label="Terminal output"
        className="term-scroll flex-1 overflow-y-auto px-4 py-4 font-mono text-[13px] leading-relaxed text-fg sm:text-sm"
      >
        <AnimatePresence initial={false}>
          {lines.map((line) => (
            <motion.div
              key={line.id}
              initial={reduce ? false : { opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18 }}
              className="mb-2 break-words"
            >
              {line.input !== undefined && (
                <p>
                  <span className="text-phos">{PROMPT}</span>
                  <span className="text-dim">:{line.cwd ?? "~"}$ </span>
                  {line.input}
                </p>
              )}
              {line.output != null && <div className="mt-0.5">{line.output}</div>}
            </motion.div>
          ))}
        </AnimatePresence>

        {booted && (
          <div className="flex items-center">
            <label htmlFor="term-input" className="shrink-0">
              <span className="text-phos">{PROMPT}</span>
              <span className="text-dim">:{cwd}$&nbsp;</span>
              <span className="sr-only">Type a command, for example help</span>
            </label>
            <input
              id="term-input"
              ref={inputRef}
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                setHint("");
              }}
              onKeyDown={onKeyDown}
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              enterKeyHint="go"
              className="min-w-0 flex-1 bg-transparent text-fg caret-phos outline-none"
            />
          </div>
        )}
        {hint && <p className="mt-1 text-faint">{hint}</p>}
      </div>

      <div className="flex gap-2 overflow-x-auto border-t border-line px-3 py-2.5 term-scroll" aria-label="Quick commands">
        {QUICK.map((c) => (
          <button
            key={c}
            type="button"
            disabled={!booted}
            onClick={(e) => {
              e.stopPropagation();
              execute(c);
            }}
            className="shrink-0 rounded border border-line px-2.5 py-1 font-mono text-xs text-dim transition-colors hover:border-phos-dim hover:text-phos disabled:opacity-40"
          >
            {c}
          </button>
        ))}
      </div>
      </>
      )}
    </motion.div>
    </>
  );
  // full screen escapes the page's stacking contexts so it sits above the nav
  return win === "max" ? (
    <>
      <div className="h-[440px] rounded-md border border-dashed border-line sm:h-[480px]" aria-hidden="true" />
      {createPortal(view, document.body)}
    </>
  ) : view;
}
