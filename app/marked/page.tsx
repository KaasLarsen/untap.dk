import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { MarkedCardGrid } from "@/components/MarkedCardGrid";
import { MarkedSearchForm } from "@/components/MarkedSearchForm";
import { MarkedSetList } from "@/components/MarkedSetList";
import { UntapMark } from "@/components/UntapMark";
import { searchCards, searchSets } from "@/lib/scryfall";

export const metadata: Metadata = {
  title: "Marked",
  description:
    "Søg Magic-kort og serier. Se aktuelle papirpriser i euro på untap.dk Marked.",
};

const POPULAR_CARDS = [
  "Ragavan, Nimble Pilferer",
  "Force of Will",
  "The One Ring",
  "Sol Ring",
] as const;

type MarkedPageProps = {
  searchParams: Promise<{ q?: string; tab?: string }>;
};

function parseTab(tab: string | undefined): "kort" | "serier" {
  return tab === "serier" ? "serier" : "kort";
}

export default function MarkedPage({ searchParams }: MarkedPageProps) {
  return (
    <main className="relative isolate flex-1 overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 hero-atmosphere"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 hero-texture"
      />

      <div className="mx-auto w-full max-w-6xl px-5 pb-20 pt-28 sm:px-8 sm:pb-28 sm:pt-32">
        <div className="animate-fade-rise flex items-center gap-3">
          <UntapMark className="size-8 shrink-0 text-accent sm:size-10" />
          <p className="font-display text-3xl font-semibold tracking-tight text-parchment sm:text-4xl">
            untap.dk
          </p>
        </div>
        <h1 className="animate-fade-rise delay-1 mt-5 font-display text-3xl font-medium tracking-tight text-accent sm:text-4xl md:text-5xl">
          Find priser
        </h1>
        <p className="animate-fade-rise delay-2 mt-5 max-w-2xl text-base leading-relaxed text-parchment-muted sm:text-lg">
          Søg Magic-kort og serier. Se aktuelle papirpriser i euro.
        </p>

        <Suspense fallback={<MarkedSearchFallback />}>
          <MarkedSearchAndResults searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}

async function MarkedSearchAndResults({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tab?: string }>;
}) {
  const params = await searchParams;
  const q = (params.q ?? "").trim();
  const tab = parseTab(params.tab);

  return (
    <>
      <div className="animate-fade-rise delay-3">
        <MarkedSearchForm q={q} tab={tab} />
      </div>
      <Suspense key={`${tab}:${q}`} fallback={<ResultsFallback tab={tab} />}>
        <MarkedResults q={q} tab={tab} />
      </Suspense>
    </>
  );
}

async function MarkedResults({
  q,
  tab,
}: {
  q: string;
  tab: "kort" | "serier";
}) {
  if (!q) {
    return (
      <div className="mt-10 space-y-6">
        <p className="text-base text-parchment-muted">
          {tab === "serier"
            ? "Skriv et serienavn eller en kode for at starte."
            : "Skriv et kortnavn for at se priser — eller prøv et af de populære:"}
        </p>
        {tab === "kort" ? (
          <ul className="flex flex-wrap gap-2">
            {POPULAR_CARDS.map((name) => (
              <li key={name}>
                <Link
                  href={`/marked?tab=kort&q=${encodeURIComponent(name)}`}
                  className="inline-block border border-line bg-ink-elevated px-3 py-1.5 text-sm text-parchment-muted transition-colors hover:border-accent/40 hover:text-parchment"
                >
                  {name}
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    );
  }

  if (tab === "serier") {
    const sets = await searchSets(q);
    return (
      <MarkedSetList
        sets={sets}
        emptyLabel={`Ingen serier matchede “${q}”.`}
      />
    );
  }

  const cards = await searchCards(q, { order: "name", limit: 24 });
  return (
    <MarkedCardGrid
      cards={cards}
      emptyLabel={`Ingen kort matchede “${q}”.`}
    />
  );
}

function MarkedSearchFallback() {
  return (
    <div className="mt-10 space-y-4">
      <div className="h-9 w-40 animate-pulse bg-ink-elevated" />
      <div className="h-12 w-full animate-pulse bg-ink-elevated" />
      <div className="h-4 w-2/3 animate-pulse bg-ink-elevated" />
    </div>
  );
}

function ResultsFallback({ tab }: { tab: "kort" | "serier" }) {
  if (tab === "serier") {
    return (
      <div className="mt-10 space-y-0 divide-y divide-line border-y border-line">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-16 animate-pulse bg-ink-elevated/40" />
        ))}
      </div>
    );
  }

  return (
    <div className="mt-10 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="space-y-3">
          <div className="aspect-[5/7] animate-pulse bg-ink-elevated" />
          <div className="h-5 w-3/4 animate-pulse bg-ink-elevated" />
          <div className="h-4 w-1/2 animate-pulse bg-ink-elevated" />
        </div>
      ))}
    </div>
  );
}
