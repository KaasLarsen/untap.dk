import Link from "next/link";
import { Suspense } from "react";
import { Hero } from "@/components/Hero";
import { Section } from "@/components/Section";
import { TournamentDeckGrid } from "@/components/TournamentDeckGrid";
import { UntapMark } from "@/components/UntapMark";
import { getArticleBySlug } from "@/lib/content";
import { getLatestTournamentDecks } from "@/lib/tournaments";

async function LatestTournamentDecks() {
  const decks = await getLatestTournamentDecks("MO", 14);
  return <TournamentDeckGrid decks={decks.slice(0, 12)} />;
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

export default async function Home() {
  const welcome = await getArticleBySlug("welcome-post");

  return (
    <>
      <Hero />

      <Section
        id="decklists"
        eyebrow="Søjle 01"
        title="Decklists"
        contentClassName="max-w-6xl"
      >
        <p>
          Seneste Modern-decks — vælg format, se metagame-% og dyk ned i events.
        </p>
        <Suspense fallback={<TournamentDeckGridFallback />}>
          <LatestTournamentDecks />
        </Suspense>
        <p className="mt-8">
          <Link
            href="/deck/f/modern"
            className="text-accent-bright underline-offset-4 hover:underline"
          >
            Åbn format-browser
          </Link>
        </p>
      </Section>

      <Section id="strategi" eyebrow="Søjle 02" title="Strategi">
        <p>
          Artikler og guides, der gør dig skarpere ved bordet. Start med vores
          velkomstindlæg, og følg med når flere tekster lander under Artikler.
        </p>
        <p className="mt-4">
          {welcome ? (
            <Link
              href={`/artikler/${welcome.slug}`}
              className="text-accent-bright underline-offset-4 hover:underline"
            >
              Læs: {welcome.title}
            </Link>
          ) : (
            <Link
              href="/artikler"
              className="text-accent-bright underline-offset-4 hover:underline"
            >
              Se artikler
            </Link>
          )}
        </p>
      </Section>

      <Section id="marked" eyebrow="Søjle 03" title="Marked">
        <p>
          Søg på kort og serier med Scryfall EUR-priser, og se CardMarket
          pristrends via PokéWallet — kun ægte tal.
        </p>
        <p className="mt-4">
          <Link
            href="/marked"
            className="text-accent-bright underline-offset-4 hover:underline"
          >
            Åbn Marked
          </Link>
        </p>
      </Section>

      <footer className="border-t border-line px-5 py-10 text-center text-sm text-parchment-muted sm:px-8">
        <p className="inline-flex items-center justify-center gap-2 font-display text-lg text-parchment">
          <UntapMark className="size-4 text-accent" />
          untap.dk
        </p>
        <p className="mt-2">Vi bygger i mørket. Untap, Upkeep, Draw.</p>
      </footer>
    </>
  );
}
