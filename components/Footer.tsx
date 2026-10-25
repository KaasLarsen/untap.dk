import Link from "next/link";
import { UntapMark } from "@/components/UntapMark";

const links = [
  { href: "/deck/f/modern", label: "Deck" },
  { href: "/artikler", label: "Artikler" },
  { href: "/marked", label: "Marked" },
] as const;

export function Footer() {
  return (
    <footer className="mt-auto border-t border-line bg-ink-elevated">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div>
          <p className="inline-flex items-center gap-2 font-display text-lg font-semibold tracking-tight text-parchment">
            <UntapMark className="size-4 text-accent" />
            untap.dk
          </p>
          <p className="mt-1 text-sm text-parchment-muted">
            Untap, Upkeep, Draw.
          </p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-5">
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-parchment-muted transition-colors hover:text-accent"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
