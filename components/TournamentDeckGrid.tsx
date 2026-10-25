import Link from "next/link";
import type { TournamentDeck } from "@/lib/spicerack";

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
        Ingen turneringsdæk lige nu. Tilføj{" "}
        <code className="text-parchment">SPICERACK_API_KEY</code> for at hente
        de seneste Modern-lister.
      </p>
    );
  }

  return (
    <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {decks.map((deck, index) => {
        const dateLabel = formatDate(deck.date);

        return (
          <li key={deck.id}>
            <Link
              href={`/deck/${encodeURIComponent(deck.id)}`}
              className="group flex h-full flex-col border border-line bg-ink-elevated/60 px-5 py-5 transition-colors hover:border-accent/50 hover:bg-ink-soft/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              style={{ animationDelay: `${Math.min(index, 8) * 0.05}s` }}
            >
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-mono text-xs tabular-nums text-accent">
                  #{deck.rank || "—"}
                </span>
                {dateLabel ? (
                  <span className="text-[11px] uppercase tracking-[0.14em] text-parchment-muted/70">
                    {dateLabel}
                  </span>
                ) : null}
              </div>

              <h3 className="mt-3 font-display text-xl tracking-tight text-parchment transition-colors group-hover:text-accent-bright">
                {deck.deck_name}
              </h3>

              <p className="mt-2 text-sm text-parchment-muted">
                {deck.player_name}
              </p>

              <p className="mt-auto pt-5 text-xs leading-relaxed text-parchment-muted/80">
                {deck.tournament_name}
              </p>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
