import Link from "next/link";
import { Suspense } from "react";
import { Hero } from "@/components/Hero";
import { PartnerBanner } from "@/components/PartnerBanner";
import { Section } from "@/components/Section";
import { TournamentDeckGrid } from "@/components/TournamentDeckGrid";
import { getHomeBillboard } from "@/lib/partners";
import { getLatestTournamentDecks } from "@/lib/tournaments";

async function LatestTournamentDecks() {
  const decks = await getLatestTournamentDecks("MO", 14);
  return <TournamentDeckGrid decks={decks.slice(0, 12)} />;
}

function TournamentDeckGridFallback() {
  return (
    <div className="mt-8 space-y-3 border-y border-line py-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="h-10 animate-pulse bg-ink-soft/80"
        />
      ))}
    </div>
  );
}

export default function Home() {
  const billboard = getHomeBillboard();

  return (
    <>
      <Hero />

      <Section
        id="overblik"
        title="Hvad vil du kigge på?"
        contentClassName="max-w-6xl"
      >
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <h3 className="font-display text-xl font-semibold text-parchment">
              Deck
            </h3>
            <p className="mt-2 text-base text-parchment-muted">
              Metagame i procent, turneringer og decklists — start i Modern
              eller skift format.
            </p>
            <Link
              href="/deck/f/modern"
              className="mt-4 inline-flex text-sm font-semibold text-accent transition-colors hover:text-accent-bright"
            >
              Åbn format-browser →
            </Link>
          </div>
          <div>
            <h3 className="font-display text-xl font-semibold text-parchment">
              Artikler
            </h3>
            <p className="mt-2 text-base text-parchment-muted">
              Strategi og guides, der gør dig skarpere ved bordet.
            </p>
            <Link
              href="/artikler"
              className="mt-4 inline-flex text-sm font-semibold text-accent transition-colors hover:text-accent-bright"
            >
              Se artikler →
            </Link>
          </div>
          <div>
            <h3 className="font-display text-xl font-semibold text-parchment">
              Marked
            </h3>
            <p className="mt-2 text-base text-parchment-muted">
              Aktuelle EUR-priser og pristrends — søg kort og serier.
            </p>
            <Link
              href="/marked"
              className="mt-4 inline-flex text-sm font-semibold text-accent transition-colors hover:text-accent-bright"
            >
              Åbn Marked →
            </Link>
          </div>
        </div>
      </Section>

      <div className="mx-auto w-full max-w-6xl px-5 py-4 sm:px-8">
        <PartnerBanner
          banner={billboard.desktop}
          mobileBanner={billboard.mobile}
        />
      </div>

      <Section
        id="decklists"
        eyebrow="Modern"
        title="Seneste decks"
        contentClassName="max-w-6xl"
      >
        <p>
          Topplaceringer fra seneste turneringer — klik ind for fuld liste.
        </p>
        <Suspense fallback={<TournamentDeckGridFallback />}>
          <LatestTournamentDecks />
        </Suspense>
        <p className="mt-8">
          <Link
            href="/deck/f/modern"
            className="text-sm font-semibold text-accent underline-offset-4 hover:underline"
          >
            Se hele metagame →
          </Link>
        </p>
      </Section>
    </>
  );
}
