"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UntapMark } from "@/components/UntapMark";

const nav = [
  { href: "/artikler", label: "Artikler", match: "/artikler" },
  { href: "/deck", label: "Deck", match: "/deck" },
  { href: "/marked", label: "Marked", match: "/marked" },
] as const;

function isActive(pathname: string, match: string) {
  return pathname === match || pathname.startsWith(`${match}/`);
}

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-line/80 bg-ink-elevated/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5 sm:h-16 sm:px-8">
        <Link
          href="/"
          className="group inline-flex items-center gap-2 font-display text-lg font-semibold tracking-tight text-parchment transition-colors hover:text-accent sm:gap-2.5 sm:text-xl"
        >
          <UntapMark className="size-5 text-accent transition-colors group-hover:text-accent-bright sm:size-6" />
          untap.dk
        </Link>
        <nav aria-label="Hovednavigation" className="flex items-center gap-1 sm:gap-2">
          {nav.map((item) => {
            const active = isActive(pathname, item.match);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={
                  active
                    ? "rounded-md bg-ink-soft px-3 py-1.5 text-sm font-medium text-accent"
                    : "rounded-md px-3 py-1.5 text-sm text-parchment-muted transition-colors hover:bg-ink-soft/70 hover:text-parchment"
                }
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
