import Link from "next/link";
import type { ScryfallSet } from "@/lib/scryfall";

type MarkedSetListProps = {
  sets: ScryfallSet[];
  emptyLabel?: string;
};

export function MarkedSetList({
  sets,
  emptyLabel = "Ingen serier fundet.",
}: MarkedSetListProps) {
  if (sets.length === 0) {
    return (
      <p className="mt-10 text-base text-parchment-muted">{emptyLabel}</p>
    );
  }

  return (
    <ul className="mt-10 divide-y divide-line border-y border-line">
      {sets.map((set, index) => (
        <li
          key={set.id}
          className="animate-fade-rise"
          style={{ animationDelay: `${Math.min(index, 10) * 0.04}s` }}
        >
          <Link
            href={`/marked/serie/${encodeURIComponent(set.code)}`}
            className="flex flex-col gap-1 py-4 transition-colors hover:bg-ink-elevated/40 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
          >
            <div>
              <p className="font-display text-xl tracking-tight text-parchment">
                {set.name}
              </p>
              <p className="mt-1 text-sm uppercase tracking-[0.14em] text-parchment-muted">
                {set.code}
                {set.set_type ? ` · ${set.set_type.replaceAll("_", " ")}` : ""}
              </p>
            </div>
            <div className="shrink-0 text-sm text-parchment-muted sm:text-right">
              <p>{set.card_count} kort</p>
              {set.released_at ? (
                <p className="mt-0.5">
                  {new Intl.DateTimeFormat("da-DK", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    timeZone: "Europe/Copenhagen",
                  }).format(new Date(`${set.released_at}T12:00:00Z`))}
                </p>
              ) : null}
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
