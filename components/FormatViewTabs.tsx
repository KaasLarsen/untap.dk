import Link from "next/link";
import type { ReactNode } from "react";

type FormatViewTabsProps = {
  formatSlug: string;
  active: "metagame" | "events";
};

export function FormatViewTabs({ formatSlug, active }: FormatViewTabsProps) {
  const base = `/deck/f/${formatSlug}`;

  return (
    <div
      role="tablist"
      aria-label="Visning"
      className="inline-flex rounded-lg border border-line bg-ink-elevated p-1"
    >
      <TabLink href={base} active={active === "metagame"}>
        Metagame
      </TabLink>
      <TabLink href={`${base}?view=events`} active={active === "events"}>
        Turneringer
      </TabLink>
    </div>
  );
}

function TabLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      role="tab"
      aria-selected={active}
      className={
        active
          ? "rounded-md bg-ink-soft px-4 py-2 text-sm font-semibold text-accent"
          : "rounded-md px-4 py-2 text-sm text-parchment-muted transition-colors hover:text-parchment"
      }
    >
      {children}
    </Link>
  );
}
