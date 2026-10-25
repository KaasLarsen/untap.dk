import type { Metadata } from "next";
import { Suspense } from "react";
import { Decklist } from "@/components/Decklist";

export const metadata: Metadata = {
  title: "Deck",
  description: "Decklists med Scryfall-tooltips på untap.dk.",
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

export default function DeckPage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center gap-10 px-5 py-16 sm:px-8 sm:py-24">
      <div className="max-w-xl space-y-3 text-center">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
          Decklists
        </p>
        <h1 className="font-display text-4xl tracking-tight text-parchment sm:text-5xl">
          Hover et kort
        </h1>
        <p className="text-base leading-relaxed text-parchment-muted sm:text-lg">
          Rå decklist-tekst henter Scryfall-data — hold musen over et navn for at
          se kortbilledet.
        </p>
      </div>

      <Suspense fallback={<DecklistFallback />}>
        <Decklist raw={SAMPLE_DECKLIST} title="UR Delver" />
      </Suspense>
    </main>
  );
}
