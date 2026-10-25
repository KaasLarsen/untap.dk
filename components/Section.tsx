import type { ReactNode } from "react";

type SectionProps = {
  id?: string;
  eyebrow?: string;
  title: string;
  children: ReactNode;
  className?: string;
};

export function Section({ id, eyebrow, title, children, className = "" }: SectionProps) {
  return (
    <section
      id={id}
      className={`border-t border-line bg-ink px-5 py-20 sm:px-8 sm:py-28 ${className}`}
    >
      <div className="mx-auto max-w-3xl">
        {eyebrow ? (
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-accent">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="font-display text-3xl tracking-tight text-parchment sm:text-4xl">
          {title}
        </h2>
        <div className="mt-5 text-base leading-relaxed text-parchment-muted sm:text-lg">
          {children}
        </div>
      </div>
    </section>
  );
}
