import type { ReactNode } from "react";

type SectionProps = {
  id?: string;
  eyebrow?: string;
  title: string;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
};

export function Section({
  id,
  eyebrow,
  title,
  children,
  className = "",
  contentClassName = "max-w-3xl",
}: SectionProps) {
  return (
    <section
      id={id}
      className={`border-t border-line bg-ink px-5 py-16 sm:px-8 sm:py-20 ${className}`}
    >
      <div className={`mx-auto ${contentClassName}`}>
        {eyebrow ? (
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-accent">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="font-display text-3xl font-semibold tracking-tight text-parchment sm:text-4xl">
          {title}
        </h2>
        <div className="mt-5 text-base leading-relaxed text-parchment-muted sm:text-lg">
          {children}
        </div>
      </div>
    </section>
  );
}
