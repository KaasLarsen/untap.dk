import Link from "next/link";
import { UntapMark } from "@/components/UntapMark";

const nav = [
  { href: "/artikler", label: "Artikler" },
  { href: "/deck", label: "Deck" },
  { href: "/marked", label: "Marked" },
] as const;

export function Header() {
  return (
    <header className="absolute inset-x-0 top-0 z-20 border-b border-line/40 bg-ink/40 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5 sm:h-16 sm:px-8">
        <Link
          href="/"
          className="group inline-flex items-center gap-2 font-display text-lg tracking-wide text-parchment transition-colors hover:text-accent-bright sm:gap-2.5 sm:text-xl"
        >
          <UntapMark className="size-5 text-accent transition-colors group-hover:text-accent-bright sm:size-6" />
          untap.dk
        </Link>
        <nav aria-label="Hovednavigation" className="flex items-center gap-5 sm:gap-8">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-parchment-muted transition-colors hover:text-parchment"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
