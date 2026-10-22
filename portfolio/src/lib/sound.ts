// Synthesized key clicks (no audio files). Off by default; the choice is remembered.
const KEY = "sujal-sound";
let ctx: AudioContext | null = null;
let enabled = (() => { try { return localStorage.getItem(KEY) === "on"; } catch { return false; } })();

export const soundOn = () => enabled;

export function setSound(on: boolean) {
  enabled = on;
  try { localStorage.setItem(KEY, on ? "on" : "off"); } catch { /* ignore */ }
  window.dispatchEvent(new CustomEvent("sound-change", { detail: on }));
  if (on) click("key");
}

export function click(kind: "key" | "cap" | "enter" = "key") {
  if (!enabled) return;
  try {
    ctx ??= new AudioContext();
    if (ctx.state === "suspended") void ctx.resume();
    const t = ctx.currentTime;
    // short filtered noise burst = the "tick" of a switch
    const len = kind === "enter" ? 0.05 : 0.025;
    const buf = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * len), ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 3);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const f = ctx.createBiquadFilter();
    f.type = "bandpass";
    f.frequency.value = kind === "cap" ? 1800 : kind === "enter" ? 900 : 2600 + Math.random() * 600;
    f.Q.value = 1.2;
    const g = ctx.createGain();
    g.gain.setValueAtTime(kind === "enter" ? 0.5 : 0.32, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + len);
    src.connect(f).connect(g).connect(ctx.destination);
    src.start(t);
  } catch { /* audio unavailable */ }
}
