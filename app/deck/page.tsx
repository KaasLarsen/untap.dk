import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Decklist } from "@/components/Decklist";
import { TournamentDeckGrid } from "@/components/TournamentDeckGrid";
import { getLatestTournamentDecks } from "@/lib/tournaments";

export const metadata: Metadata = {
  title: "Deck",
  description: "Turneringsdæk og Scryfall-tooltips på untap.dk.",
};

const SAMPLE_DECKLIST = `4 Delver of Secrets
4 Brainstorm
4 Force of Will
3 Daze
4 Ponder
2 Spell Pierce
1 Murktide Regent
18 Island

Sideboard
2 Surgical Extraction
2 Flusterstorm
1 Grafdigger's Cage
`;

function DecklistFallback() {
  return (
    <div className="h-[28rem] w-full max-w-md animate-pulse rounded-2xl border border-line bg-ink-elevated" />
  );
}

function TournamentDeckGridFallback() {
  return (
    <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="h-36 animate-pulse border border-line bg-ink-elevated/40"
        />
      ))}
    </div>
  );
}

async function LatestTournamentDecks() {
  const decks = await getLatestTournamentDecks("MODERN", 14);
  return <TournamentDeckGrid decks={decks.slice(0, 24)} />;
}

export default function DeckPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-16 px-5 py-16 sm:px-8 sm:py-24">
      <div className="max-w-xl space-y-3">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
          Decklists
        </p>
        <h1 className="font-display text-4xl tracking-tight text-parchment sm:text-5xl">
          Turneringsdæk
        </h1>
        <p className="text-base leading-relaxed text-parchment-muted sm:text-lg">
          Seneste Modern-lister fra MTGTop8. Åbn et dæk for at se kortene med
          Scryfall-tooltips.
        </p>
      </div>

      <Suspense fallback={<TournamentDeckGridFallback />}>
        <LatestTournamentDecks />
      </Suspense>

      <section className="space-y-8 border-t border-line pt-16">
        <div className="max-w-xl space-y-3">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
            Demo
          </p>
          <h2 className="font-display text-3xl tracking-tight text-parchment">
            Hover et kort
          </h2>
          <p className="text-base leading-relaxed text-parchment-muted">
            Eksempel på Scryfall-integration — hold musen over et navn for at se
            kortbilledet.
          </p>
        </div>

        <Suspense fallback={<DecklistFallback />}>
          <Decklist raw={SAMPLE_DECKLIST} title="UR Delver" />
        </Suspense>

        <p>
          <Link
            href="/#decklists"
            className="text-sm text-accent-bright underline-offset-4 hover:underline"
          >
            ← Tilbage til forsiden
          </Link>
        </p>
      </section>
    </main>
  );
}
