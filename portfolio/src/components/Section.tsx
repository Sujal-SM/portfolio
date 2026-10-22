import type { ReactNode } from "react";

type Props = { id: string; index: number; command: string; title: string; children: ReactNode };

// Each section opens with the shell command that "prints" it.
export function Section({ id, index, command, title, children }: Props) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="border-t border-line py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <p className="font-mono text-sm text-dim">
          <span className="text-faint">[{index}]</span> <span className="text-phos">~</span>$ {command}
        </p>
        <h2 id={`${id}-title`} tabIndex={-1} className="mt-3 text-3xl font-semibold tracking-tight text-fg sm:text-4xl focus:outline-none">
          {title}
        </h2>
        <div className="mt-10">{children}</div>
      </div>
    </section>
  );
}
