import Link from "next/link";
import type { DeckRef } from "@/lib/tournaments";
import { deckHrefId } from "@/lib/mtgtop8";

type DeckRefListProps = {
  decks: DeckRef[];
  formatSlug: string;
  emptyLabel?: string;
};

export function DeckRefList({
  decks,
  formatSlug,
  emptyLabel = "Ingen decks fundet.",
}: DeckRefListProps) {
  if (decks.length === 0) {
    return <p className="text-parchment-muted">{emptyLabel}</p>;
  }

  return (
    <ul className="divide-y divide-line border border-line">
      {decks.map((deck) => (
        <li key={`${deck.eventId}-${deck.deckId}`}>
          <Link
            href={`/deck/${deckHrefId(deck.eventId, deck.deckId)}?format=${formatSlug}`}
            className="group flex items-baseline gap-4 px-4 py-3 transition-colors hover:bg-ink-elevated/80"
          >
            <span className="w-10 shrink-0 font-mono text-xs tabular-nums text-accent">
              #{deck.rank || "—"}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-lg text-parchment group-hover:text-accent-bright">
                {deck.deckName}
              </p>
              <p className="mt-0.5 truncate text-sm text-parchment-muted">
                {deck.playerName}
                {deck.tournamentName && deck.tournamentName !== "MTGTop8"
                  ? ` · ${deck.tournamentName}`
                  : ""}
              </p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
