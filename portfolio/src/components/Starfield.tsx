import { useEffect, useRef } from "react";
import { accentRGB } from "../lib/theme";

type Star = { x: number; y: number; r: number; a: number; tw: number };
type Meteor = { x: number; y: number; vx: number; vy: number; life: number; max: number; len: number };

// Fixed starfield behind the page with the occasional shooting star.
// Static stars only when the visitor prefers reduced motion; pauses when the tab is hidden.
export function Starfield() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0, h = 0, lastW = -1, raf = 0, stars: Star[] = [], meteors: Meteor[] = [];
    let nextMeteor = performance.now() + 800;
    let rgb = accentRGB();
    const onAccent = () => { rgb = accentRGB(); };

    function resize() {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      w = innerWidth;
      h = innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (w === lastW && stars.length) { if (reduce) draw(0); return; } // mobile URL bar resize: keep stars
      lastW = w;
      const count = Math.round((w * h) / 5200);
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() < 0.9 ? Math.random() * 0.8 + 0.2 : Math.random() * 0.6 + 1,
        a: Math.random() * 0.5 + 0.15,
        tw: Math.random() * Math.PI * 2,
      }));
      if (reduce) draw(0);
    }

    function spawn(at?: { x: number; y: number }) {
      // enter from the top or right edge (or start where the visitor clicked), travel down-left
      const fromTop = Math.random() < 0.6;
      const speed = 10 + Math.random() * 6;
      const angle = (Math.PI * (0.72 + Math.random() * 0.12)); // ~130-150 degrees
      meteors.push({
        x: at ? at.x : fromTop ? w * (0.3 + Math.random() * 0.7) : w + 20,
        y: at ? at.y : fromTop ? -20 : h * Math.random() * 0.5,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        max: 55 + Math.random() * 35,
        len: 170 + Math.random() * 120,
      });
    }

    function draw(t: number) {
      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        const a = reduce ? s.a : s.a * (0.65 + 0.35 * Math.sin(t / 900 + s.tw));
        ctx.globalAlpha = a;
        ctx.fillStyle = s.r > 1 ? "#cfe3d6" : "#9aa59e";
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      for (const m of meteors) {
        const fade = Math.sin((m.life / m.max) * Math.PI); // ease in and out
        const sp = Math.hypot(m.vx, m.vy);
        const tx = m.x - (m.vx / sp) * m.len;
        const ty = m.y - (m.vy / sp) * m.len;
        const g = ctx.createLinearGradient(m.x, m.y, tx, ty);
        g.addColorStop(0, `rgba(220,236,226,${0.85 * fade})`);
        g.addColorStop(0.25, `rgba(${rgb},${0.5 * fade})`);
        g.addColorStop(1, `rgba(${rgb},0)`);
        ctx.strokeStyle = g;
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(tx, ty);
        ctx.stroke();
        const glow = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, 7);
        glow.addColorStop(0, `rgba(240,250,244,${fade})`);
        glow.addColorStop(1, `rgba(${rgb},0)`);
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(m.x, m.y, 7, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function tick(t: number) {
      if (t > nextMeteor) {
        spawn();
        if (Math.random() < 0.2) setTimeout(spawn, 250); // occasional pair
        nextMeteor = t + 1600 + Math.random() * 2600;
      }
      for (const m of meteors) {
        m.x += m.vx;
        m.y += m.vy;
        m.life++;
      }
      meteors = meteors.filter((m) => m.life < m.max);
      draw(t);
      raf = requestAnimationFrame(tick);
    }

    function onVis() {
      cancelAnimationFrame(raf);
      if (!document.hidden && !reduce) raf = requestAnimationFrame(tick);
    }

    // click any empty part of the page to launch a shooting star from that spot
    function onDown(e: PointerEvent) {
      if (reduce) return;
      const el = e.target as HTMLElement;
      if (el.closest("a,button,input,textarea,label,[role=dialog],[role=log],kbd,svg,img")) return;
      if (window.getSelection()?.toString()) return;
      spawn({ x: e.clientX, y: e.clientY });
    }

    resize();
    addEventListener("resize", resize);
    addEventListener("pointerdown", onDown);
    addEventListener("accent-change", onAccent);
    const onShower = () => { if (reduce) return; for (let i = 0; i < 14; i++) setTimeout(() => spawn(), i * 120 + Math.random() * 100); };
    addEventListener("meteor-shower", onShower);
    document.addEventListener("visibilitychange", onVis);
    if (!reduce) raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("resize", resize);
      removeEventListener("pointerdown", onDown);
      removeEventListener("accent-change", onAccent);
      removeEventListener("meteor-shower", onShower);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none fixed inset-0 z-0" />;
}
