import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Decklist } from "@/components/Decklist";
import { PageShell } from "@/components/PageShell";
import { getTournamentDeckById } from "@/lib/tournaments";

type DeckDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ format?: string }>;
};

export async function generateMetadata({
  params,
  searchParams,
}: DeckDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const { format } = await searchParams;
  const deck = await getTournamentDeckById(
    decodeURIComponent(id),
    format || "MO",
  );

  if (!deck) {
    return { title: "Deck ikke fundet" };
  }

  return {
    title: deck.deck_name || "Deck",
    description: `${deck.deck_name} af ${deck.player_name} — ${deck.tournament_name}`,
  };
}

function DeckDetailFallback() {
  return (
    <PageShell width="wide">
      <div className="space-y-4">
        <div className="h-3 w-24 animate-pulse bg-ink-soft" />
        <div className="h-10 w-72 animate-pulse bg-ink-soft" />
        <div className="h-5 w-96 max-w-full animate-pulse bg-ink-soft" />
      </div>
      <div className="h-[28rem] w-full animate-pulse bg-ink-soft/60" />
    </PageShell>
  );
}

async function DeckDetail({ params, searchParams }: DeckDetailPageProps) {
  const { id } = await params;
  const { format } = await searchParams;
  const deck = await getTournamentDeckById(
    decodeURIComponent(id),
    format || "MO",
  );

  if (!deck) {
    notFound();
  }

  return (
    <PageShell width="wide">
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
          {deck.format}
        </p>
        <h1 className="font-display text-4xl font-semibold tracking-tight text-parchment sm:text-5xl">
          {deck.deck_name}
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-parchment-muted sm:text-lg">
          {deck.player_name}
          {deck.rank ? ` · #${deck.rank}` : ""}
          {deck.tournament_name ? ` · ${deck.tournament_name}` : ""}
        </p>
        <p>
          <Link
            href="/deck"
            className="text-sm font-medium text-accent underline-offset-4 hover:underline"
          >
            ← Tilbage til decklists
          </Link>
        </p>
      </div>

      <Suspense
        fallback={<div className="h-[28rem] w-full animate-pulse bg-ink-soft/60" />}
      >
        <Decklist
          entries={deck.cards}
          title={deck.deck_name || "Decklist"}
        />
      </Suspense>
    </PageShell>
  );
}

export default function DeckDetailPage(props: DeckDetailPageProps) {
  return (
    <Suspense fallback={<DeckDetailFallback />}>
      <DeckDetail {...props} />
    </Suspense>
  );
}
