import Link from "next/link";
import type { ReactNode } from "react";

type FormatViewTabsProps = {
  formatSlug: string;
  active: "metagame" | "events";
};

export function FormatViewTabs({ formatSlug, active }: FormatViewTabsProps) {
  const base = `/deck/f/${formatSlug}`;

  return (
    <div className="flex gap-6 border-b border-line">
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
      className={
        active
          ? "-mb-px border-b-2 border-accent pb-3 text-sm text-accent-bright"
          : "pb-3 text-sm text-parchment-muted transition-colors hover:text-parchment"
      }
    >
      {children}
    </Link>
  );
}
