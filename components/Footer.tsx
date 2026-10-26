import Link from "next/link";
import { UntapMark } from "@/components/UntapMark";

const primary = [
  { href: "/deck/f/modern", label: "Deck" },
  { href: "/artikler", label: "Artikler" },
  { href: "/marked", label: "Marked" },
] as const;

const legal = [
  { href: "/om", label: "Om / Kontakt" },
  { href: "/privatliv", label: "Privatliv" },
  { href: "/cookies", label: "Cookies" },
  { href: "/kilder", label: "Kilder & data" },
  { href: "/vilkaar", label: "Vilkår" },
] as const;

export function Footer() {
  return (
    <footer className="mt-auto border-t border-line bg-ink-elevated">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-10 sm:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 font-display text-lg font-semibold tracking-tight text-parchment">
              <UntapMark className="size-4 text-accent" />
              Untap.dk
            </p>
            <p className="mt-1 text-sm text-parchment-muted">
              Untap, Upkeep, Draw.
            </p>
          </div>
          <nav aria-label="Footer" className="flex flex-wrap gap-5">
            {primary.map((item) => (
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

        <nav
          aria-label="Juridisk information"
          className="flex flex-wrap gap-x-4 gap-y-2 border-t border-line pt-6"
        >
          {legal.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-xs text-parchment-muted/80 transition-colors hover:text-parchment-muted"
            >
              {item.label}
            </Link>
          ))}
          <a
            href="mailto:info@untap.dk"
            className="text-xs text-parchment-muted/80 transition-colors hover:text-parchment-muted"
          >
            info@untap.dk
          </a>
        </nav>
      </div>
    </footer>
  );
}
