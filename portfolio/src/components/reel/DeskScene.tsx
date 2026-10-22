import { motion, useReducedMotion } from "framer-motion";

type Props = { screen?: "prompt" | "push" | "dash"; typing?: boolean };

// Original illustration: an engineer in a hoodie and headphones at a desk.
export function DeskScene({ screen = "prompt", typing = true }: Props) {
  const reduce = useReducedMotion();
  const tap = !reduce && typing
    ? { animate: { rotate: [0, -6, 0, -4, 0] }, transition: { duration: 0.6, repeat: Infinity, ease: "easeInOut" as const } }
    : {};

  return (
    <svg viewBox="0 0 400 225" className="h-full w-full" role="img" aria-label="An engineer at a desk working in a terminal">
      {/* floor + wall glow */}
      <rect x="0" y="0" width="400" height="225" fill="var(--color-void)" />
      <ellipse cx="250" cy="120" rx="170" ry="90" fill="rgba(var(--phos-rgb),0.023)" />
      <line x1="0" y1="196" x2="400" y2="196" stroke="var(--color-line)" strokeWidth="1.5" />

      {/* desk */}
      <rect x="150" y="150" width="210" height="7" rx="2" fill="#1b211d" />
      <rect x="160" y="157" width="5" height="39" fill="#161b18" />
      <rect x="345" y="157" width="5" height="39" fill="#161b18" />

      {/* monitor */}
      <rect x="228" y="68" width="112" height="72" rx="4" fill="#111512" stroke="#2a332d" strokeWidth="2" />
      <rect x="279" y="140" width="10" height="8" fill="#1b211d" />
      <rect x="266" y="147" width="36" height="4" rx="2" fill="#1b211d" />
      <g fontFamily="var(--font-mono)" fontSize="7">
        {screen === "prompt" && (
          <>
            <text x="238" y="84" fill="var(--color-phos)">~$</text>
            <motion.rect x="252" y="78" width="5" height="7" fill="var(--color-phos)" animate={reduce ? {} : { opacity: [1, 0, 1] }} transition={{ duration: 1, repeat: Infinity }} />
          </>
        )}
        {screen === "push" && (
          <>
            <text x="236" y="82" fill="var(--color-phos)">~$ <tspan fill="#dbe4dd">git push</tspan></text>
            <motion.text x="236" y="94" fill="#8b978e" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}>main -&gt; main</motion.text>
            <motion.text x="236" y="106" fill="var(--color-phos)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}>pipeline started</motion.text>
          </>
        )}
        {screen === "dash" && (
          <>
            <text x="236" y="82" fill="var(--color-phos)">all checks passed</text>
            {[0, 1, 2, 3].map((i) => (
              <rect key={i} x="236" y={90 + i * 10} width={60 + ((i * 23) % 35)} height="4" rx="2" fill={i === 0 ? "var(--color-phos-dim)" : "#232a25"} />
            ))}
          </>
        )}
      </g>

      {/* mug + plant */}
      <rect x="212" y="138" width="10" height="12" rx="2" fill="var(--color-phos-dim)" />
      <path d="M222 141 q5 0 5 4 q0 4 -5 4" fill="none" stroke="var(--color-phos-dim)" strokeWidth="2" />
      <rect x="352" y="178" width="22" height="18" rx="3" fill="#1b211d" />
      <path d="M363 178 q-14 -22 -6 -36 M363 178 q2 -28 10 -34 M363 178 q12 -16 18 -18" stroke="var(--color-phos-dim)" strokeWidth="5" fill="none" strokeLinecap="round" />

      {/* chair */}
      <rect x="128" y="150" width="54" height="6" rx="3" fill="#232a25" />
      <rect x="124" y="104" width="7" height="50" rx="3" fill="#232a25" />
      <rect x="152" y="156" width="5" height="34" fill="#1b211d" />
      <rect x="138" y="190" width="34" height="4" rx="2" fill="#1b211d" />

      {/* person */}
      <g>
        {/* legs */}
        <path d="M150 150 h40 v8 h-12 v30" stroke="#2c3530" strokeWidth="12" fill="none" strokeLinejoin="round" />
        <rect x="170" y="185" width="18" height="7" rx="3" fill="var(--color-phos)" />
        {/* torso (hoodie) */}
        <rect x="134" y="98" width="38" height="56" rx="14" fill="#2c3530" />
        <line x1="160" y1="108" x2="160" y2="148" stroke="var(--color-phos)" strokeWidth="2" />
        {/* arm */}
        <motion.g style={{ originX: "150px", originY: "112px" }} {...tap}>
          <path d="M150 112 q22 18 50 26" stroke="#2c3530" strokeWidth="11" fill="none" strokeLinecap="round" />
          <circle cx="203" cy="139" r="5" fill="#e3b28e" />
        </motion.g>
        {/* head */}
        <circle cx="156" cy="80" r="17" fill="#e3b28e" />
        <path d="M139 78 q2 -20 20 -19 q14 1 15 15 q-8 -6 -18 -4 q-9 2 -17 8z" fill="#151916" />
        <circle cx="166" cy="82" r="1.6" fill="#151916" />
        {/* headphones */}
        <path d="M139 80 q0 -26 18 -26 q18 0 18 24" stroke="#151916" strokeWidth="3.5" fill="none" />
        <rect x="134" y="76" width="8" height="13" rx="3" fill="var(--color-phos)" />
      </g>
    </svg>
  );
}
