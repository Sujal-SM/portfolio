// Original line icons for the skill groups (no third-party logos).
const P: Record<string, JSX.Element> = {
  code: <path d="M9 8l-5 4 5 4M15 8l5 4-5 4M13 6l-2 12" />,
  terminal: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M7 10l3 2-3 2M12 15h5" /></>,
  cloud: <path d="M7 18h10a4 4 0 0 0 .5-7.97A6 6 0 0 0 6.1 10.5 3.75 3.75 0 0 0 7 18z" />,
  box: <><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z" /><path d="M4 7.5l8 4.5 8-4.5M12 12v9" /></>,
  layers: <><path d="M12 4l9 4.5-9 4.5-9-4.5z" /><path d="M3 12.5l9 4.5 9-4.5M3 16.5l9 4.5 9-4.5" /></>,
  loop: <><path d="M17 3l3 3-3 3" /><path d="M20 6H9a5 5 0 0 0-5 5" /><path d="M7 21l-3-3 3-3" /><path d="M4 18h11a5 5 0 0 0 5-5" /></>,
  shield: <><path d="M12 3l8 3v6c0 4.5-3.4 8.2-8 9-4.6-.8-8-4.5-8-9V6z" /><path d="M9 12l2 2 4-4" /></>,
  pulse: <path d="M3 12h4l2-6 4 12 2-6h6" />,
  spark: <><path d="M12 3v4M12 17v4M3 12h4M17 12h4" /><path d="M12 8l1.5 2.5L16 12l-2.5 1.5L12 16l-1.5-2.5L8 12l2.5-1.5z" /></>,
};

export function SkillIcon({ name }: { name: string }) {
  return (
    <span className="grid size-10 shrink-0 place-items-center rounded-lg border border-line bg-panel-2 text-phos" aria-hidden="true">
      <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        {P[name] ?? P.code}
      </svg>
    </span>
  );
}
