import type { ReactNode } from "react";
import { PageShell } from "@/components/PageShell";

type LegalPageProps = {
  title: string;
  description?: string;
  updated?: string;
  children: ReactNode;
};

export function LegalPage({
  title,
  description,
  updated = "26. oktober 2026",
  children,
}: LegalPageProps) {
  return (
    <PageShell width="narrow">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
          Information
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-parchment sm:text-5xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-5 max-w-xl text-base leading-relaxed text-parchment-muted sm:text-lg">
            {description}
          </p>
        ) : null}
        <p className="mt-4 text-xs text-parchment-muted">
          Senest opdateret: {updated}
        </p>
      </div>
      <div className="prose-untap border-t border-line pt-10">{children}</div>
    </PageShell>
  );
}
