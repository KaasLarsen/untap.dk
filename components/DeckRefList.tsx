import Link from "next/link";
import type { DeckRef } from "@/lib/tournaments";
import { deckHrefId } from "@/lib/mtgtop8";

type DeckRefListProps = {
  decks: DeckRef[];
  formatSlug: string;
  emptyLabel?: string;
};

function formatDate(date: string) {
  if (!date) return null;

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;

  return new Intl.DateTimeFormat("da-DK", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Europe/Copenhagen",
  }).format(parsed);
}

function tournamentLabel(name: string) {
  if (!name || name === "MTGTop8") return "";
  return name;
}

export function DeckRefList({
  decks,
  formatSlug,
  emptyLabel = "Ingen decks fundet.",
}: DeckRefListProps) {
  if (decks.length === 0) {
    return <p className="text-parchment-muted">{emptyLabel}</p>;
  }

  return (
    <ul className="divide-y divide-line border-y border-line">
      {decks.map((deck) => {
        const event = tournamentLabel(deck.tournamentName);
        const dateLabel = formatDate(deck.date);

        return (
          <li key={`${deck.eventId}-${deck.deckId}`}>
            <Link
              href={`/deck/${deckHrefId(deck.eventId, deck.deckId)}?format=${formatSlug}`}
              className="group grid grid-cols-[auto_1fr_auto] items-baseline gap-x-4 gap-y-1 py-3.5 transition-colors hover:bg-ink-elevated sm:grid-cols-[3.5rem_minmax(0,1.2fr)_minmax(0,0.8fr)_minmax(0,1fr)_6.5rem] sm:gap-x-5"
            >
              <span className="font-mono text-xs tabular-nums text-accent">
                {deck.rank ? `#${deck.rank}` : "—"}
              </span>

              <div className="min-w-0">
                <p className="truncate font-display text-base font-semibold tracking-tight text-parchment transition-colors group-hover:text-accent sm:text-lg">
                  {deck.deckName}
                </p>
                <p className="mt-0.5 truncate text-sm text-parchment-muted sm:hidden">
                  {deck.playerName}
                  {event ? ` · ${event}` : ""}
                </p>
              </div>

              <p className="hidden min-w-0 truncate text-sm text-parchment-muted sm:block">
                {deck.playerName}
              </p>

              <p className="hidden min-w-0 truncate text-sm text-parchment-muted sm:block">
                {event || "—"}
              </p>

              <span className="justify-self-end text-right text-xs tabular-nums text-parchment-muted">
                {dateLabel || "—"}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
