import Link from "next/link";
import { FORMATS, type FormatDefinition } from "@/lib/formats";

type FormatMenuProps = {
  activeSlug?: string;
};

export function FormatMenu({ activeSlug }: FormatMenuProps) {
  return (
    <nav aria-label="Format" className="flex flex-wrap gap-2">
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
      className={
        active
          ? "border border-accent bg-accent/15 px-3 py-1.5 text-sm text-accent-bright"
          : "border border-line px-3 py-1.5 text-sm text-parchment-muted transition-colors hover:border-parchment-muted hover:text-parchment"
      }
    >
      {format.label}
    </Link>
  );
}
