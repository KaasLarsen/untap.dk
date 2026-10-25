import Link from "next/link";
import { FORMATS, type FormatDefinition } from "@/lib/formats";

type FormatMenuProps = {
  activeSlug?: string;
};

export function FormatMenu({ activeSlug }: FormatMenuProps) {
  return (
    <nav
      aria-label="Format"
      className="sticky top-14 z-20 -mx-5 flex gap-2 overflow-x-auto border-y border-line bg-ink/95 px-5 py-3 backdrop-blur-sm sm:top-16 sm:mx-0 sm:rounded-lg sm:border sm:px-3"
    >
      {FORMATS.map((format) => (
        <FormatChip
          key={format.code}
          format={format}
          active={activeSlug === format.slug}
        />
      ))}
    </nav>
  );
}

function FormatChip({
  format,
  active,
}: {
  format: FormatDefinition;
  active: boolean;
}) {
  return (
    <Link
      href={`/deck/f/${format.slug}`}
      aria-current={active ? "page" : undefined}
      className={
        active
          ? "shrink-0 rounded-md bg-accent px-3 py-1.5 text-sm font-semibold text-white"
          : "shrink-0 rounded-md bg-ink-elevated px-3 py-1.5 text-sm text-parchment-muted transition-colors hover:bg-ink-soft hover:text-parchment"
      }
    >
      {format.label}
    </Link>
  );
}
