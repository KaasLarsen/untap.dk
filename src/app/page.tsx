import { Suspense } from "react";
import { Decklist } from "@/components/Decklist";

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
    <div className="h-[28rem] w-full max-w-md animate-pulse rounded-2xl border border-zinc-800/90 bg-zinc-900/80" />
  );
}

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center gap-10 px-6 py-16 sm:py-24">
        <div className="max-w-xl space-y-3 text-center">
          <h1 className="font-serif text-5xl tracking-tight text-zinc-50 sm:text-6xl">
            untap.dk
          </h1>
          <p className="text-base leading-relaxed text-zinc-400 sm:text-lg">
            Decklists med Scryfall-tooltips — hover et kortnavn for at se
            billedet.
          </p>
        </div>

        <Suspense fallback={<DecklistFallback />}>
          <Decklist raw={SAMPLE_DECKLIST} title="UR Delver" />
        </Suspense>
      </main>
    </div>
  );
}
