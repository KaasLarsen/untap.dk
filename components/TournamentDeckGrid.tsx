import Link from "next/link";
import type { TournamentDeck } from "@/lib/tournaments";

type TournamentDeckGridProps = {
  decks: TournamentDeck[];
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

export function TournamentDeckGrid({ decks }: TournamentDeckGridProps) {
  if (decks.length === 0) {
    return (
      <p className="mt-8 text-base text-parchment-muted">
        Ingen decks lige nu — kig tilbage snart.
      </p>
    );
  }

  return (
    <ul className="mt-8 divide-y divide-line border-y border-line">
      {decks.map((deck, index) => {
        const dateLabel = formatDate(deck.date);

        return (
          <li
            key={deck.id}
            className="animate-fade-rise"
            style={{ animationDelay: `${Math.min(index, 8) * 0.04}s` }}
          >
            <Link
              href={`/deck/${encodeURIComponent(deck.id)}`}
              className="group grid grid-cols-[auto_1fr_auto] items-baseline gap-x-4 gap-y-1 py-3.5 transition-colors hover:bg-ink-elevated sm:grid-cols-[3rem_minmax(0,1.2fr)_minmax(0,0.8fr)_minmax(0,1fr)_6.5rem] sm:gap-x-5"
            >
              <span className="font-mono text-xs tabular-nums text-accent">
                #{deck.rank || "—"}
              </span>

              <div className="min-w-0">
                <p className="truncate font-display text-base font-semibold tracking-tight text-parchment transition-colors group-hover:text-accent sm:text-lg">
                  {deck.deck_name}
                </p>
                <p className="mt-0.5 truncate text-sm text-parchment-muted sm:hidden">
                  {deck.player_name}
                  {deck.tournament_name ? ` · ${deck.tournament_name}` : ""}
                </p>
              </div>

              <p className="hidden min-w-0 truncate text-sm text-parchment-muted sm:block">
                {deck.player_name}
              </p>

              <p className="hidden min-w-0 truncate text-sm text-parchment-muted sm:block">
                {deck.tournament_name}
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
