import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";

// "byte": an original terminal-headed robot that peeks over the hero terminal.
// Eyes follow the pointer, it blinks, waves on hover and talks when clicked.
const LINES = [
  "hi, I'm byte. type help in the terminal.",
  "terraform apply: Apply complete!",
  "kubectl get pods: all Running.",
  "argocd: synced and healthy.",
  "press ctrl k to jump anywhere.",
  "click the sky for a shooting star.",
];

export function Mascot() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLButtonElement>(null);
  const ex = useMotionValue(0);
  const ey = useMotionValue(0);
  const sx = useSpring(ex, { stiffness: 300, damping: 25 });
  const sy = useSpring(ey, { stiffness: 300, damping: 25 });
  const [blink, setBlink] = useState(false);
  const [say, setSay] = useState<string | null>(null);
  const [i, setI] = useState(0);
  const [wave, setWave] = useState(false);

  // eye tracking
  useEffect(() => {
    if (reduce) return;
    function move(e: PointerEvent) {
      const r = ref.current?.getBoundingClientRect();
      if (!r) return;
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const d = Math.hypot(dx, dy) || 1;
      const k = Math.min(1, d / 300);
      ex.set((dx / d) * 4 * k);
      ey.set((dy / d) * 3 * k);
    }
    addEventListener("pointermove", move);
    return () => removeEventListener("pointermove", move);
  }, [reduce, ex, ey]);

  // blinking
  useEffect(() => {
    if (reduce) return;
    let t: ReturnType<typeof setTimeout>;
    const loop = () => {
      t = setTimeout(() => {
        setBlink(true);
        setTimeout(() => setBlink(false), 140);
        loop();
      }, 2500 + Math.random() * 3000);
    };
    loop();
    return () => clearTimeout(t);
  }, [reduce]);

  // say hello once after the terminal boots
  useEffect(() => {
    const a = setTimeout(() => setSay(LINES[0]), 1900);
    const b = setTimeout(() => setSay(null), 5200);
    return () => { clearTimeout(a); clearTimeout(b); };
  }, []);

  useEffect(() => {
    if (!say) return;
    const t = setTimeout(() => setSay(null), 3200);
    return () => clearTimeout(t);
  }, [say]);

  function talk() {
    const n = (i + 1) % LINES.length;
    setI(n);
    setSay(LINES[n]);
    setWave(true);
    setTimeout(() => setWave(false), 900);
  }

  return (
    <div className="pointer-events-none absolute -top-[82px] right-6 z-20 sm:right-10">
      <AnimatePresence>
        {say && (
          <motion.p
            key={say}
            role="status"
            initial={{ opacity: 0, x: 8, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.18 }}
            className="absolute right-[118px] top-2 w-max max-w-[220px] rounded border border-line bg-panel-2 px-3 py-2 font-mono text-xs text-fg shadow-lg"
          >
            {say}
            <span aria-hidden="true" className="absolute -right-[5px] top-4 size-2.5 rotate-45 border-r border-t border-line bg-panel-2" />
          </motion.p>
        )}
      </AnimatePresence>

      <motion.button
        ref={ref}
        type="button"
        onClick={talk}
        onHoverStart={() => setWave(true)}
        onHoverEnd={() => setWave(false)}
        aria-label="byte, the site mascot. Click for a tip."
        className="pointer-events-auto block cursor-pointer rounded-md"
        animate={reduce ? {} : { y: [0, -3, 0] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg width="110" height="94" viewBox="0 0 110 94" aria-hidden="true">
          {/* antenna */}
          <line x1="55" y1="14" x2="55" y2="4" stroke="#3a463e" strokeWidth="2.5" strokeLinecap="round" />
          <motion.circle
            cx="55" cy="4" r="3.5" fill="var(--color-phos)"
            animate={reduce ? {} : { opacity: [1, 0.35, 1] }}
            transition={{ duration: 1.6, repeat: Infinity }}
          />
          {/* head: a little monitor */}
          <rect x="12" y="14" width="86" height="62" rx="9" fill="#151916" stroke="#2f3a33" strokeWidth="2" />
          <rect x="20" y="21" width="70" height="46" rx="4" fill="#0a0d0b" />
          <rect x="20" y="21" width="70" height="3" rx="1.5" fill="#1b211d" />
          {/* ears / bolts */}
          <rect x="6" y="36" width="7" height="16" rx="2" fill="#2a332d" />
          <rect x="97" y="36" width="7" height="16" rx="2" fill="#2a332d" />
          {/* face: cursor-block eyes + prompt mouth */}
          <motion.g style={{ x: sx, y: sy }}>
            <motion.rect x="37" y="34" width="9" height="12" rx="1.5" fill="var(--color-phos)" animate={{ scaleY: blink ? 0.1 : 1 }} style={{ originY: "40px" }} transition={{ duration: 0.07 }} />
            <motion.rect x="64" y="34" width="9" height="12" rx="1.5" fill="var(--color-phos)" animate={{ scaleY: blink ? 0.1 : 1 }} style={{ originY: "40px" }} transition={{ duration: 0.07 }} />
            <text x="47" y="61" fill="var(--color-phos-dim)" fontFamily="var(--font-mono)" fontSize="10">&gt;_</text>
          </motion.g>
          {/* hands gripping the terminal edge */}
          <rect x="20" y="82" width="16" height="10" rx="4" fill="#2f3a33" />
          <motion.g
            style={{ originX: "82px", originY: "92px" }}
            animate={wave && !reduce ? { rotate: [0, -28, 8, -22, 0], y: [0, -10, -10, -10, 0] } : { rotate: 0, y: 0 }}
            transition={{ duration: 0.9 }}
          >
            <rect x="74" y="82" width="16" height="10" rx="4" fill="#2f3a33" />
          </motion.g>
          <rect x="44" y="76" width="22" height="8" rx="2" fill="#1b211d" />
        </svg>
      </motion.button>
    </div>
  );
}
