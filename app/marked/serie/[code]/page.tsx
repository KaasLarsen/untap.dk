import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { MarkedCardGrid } from "@/components/MarkedCardGrid";
import { getCardsInSet, getSetByCode } from "@/lib/scryfall";

type SetPageProps = {
  params: Promise<{ code: string }>;
};

export async function generateMetadata({
  params,
}: SetPageProps): Promise<Metadata> {
  const { code } = await params;
  const set = await getSetByCode(decodeURIComponent(code));

  if (!set) {
    return { title: "Serie ikke fundet" };
  }

  return {
    title: set.name,
    description: `${set.name} (${set.code.toUpperCase()}) — kort og EUR-priser på untap.dk Marked.`,
  };
}

export default function MarkedSetPage({ params }: SetPageProps) {
  return (
    <Suspense fallback={<SetFallback />}>
      <MarkedSetDetail params={params} />
    </Suspense>
  );
}

async function MarkedSetDetail({ params }: SetPageProps) {
  const { code } = await params;
  const setCode = decodeURIComponent(code);
  const set = await getSetByCode(setCode);

  if (!set) {
    notFound();
  }

  const cards = await getCardsInSet(set.code, 48);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-5 py-16 sm:px-8 sm:py-24">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
        Marked · Serie
      </p>
      <h1 className="mt-4 font-display text-4xl tracking-tight text-parchment sm:text-5xl">
        {set.name}
      </h1>
      <p className="mt-3 max-w-2xl text-base text-parchment-muted sm:text-lg">
        <span className="uppercase tracking-wide">{set.code}</span>
        {set.set_type ? ` · ${set.set_type.replaceAll("_", " ")}` : ""}
        {" · "}
        {set.card_count} kort
        {set.released_at
          ? ` · ${new Intl.DateTimeFormat("da-DK", {
              year: "numeric",
              month: "long",
              day: "numeric",
              timeZone: "Europe/Copenhagen",
            }).format(new Date(`${set.released_at}T12:00:00Z`))}`
          : ""}
      </p>
      <p className="mt-4 text-sm text-parchment-muted">
        Viser op til 48 print med aktuel EUR-pris.
      </p>

      <MarkedCardGrid
        cards={cards}
        emptyLabel="Ingen kort fundet i denne serie."
      />

      <p className="mt-14">
        <Link
          href="/marked?tab=serier"
          className="text-sm text-accent-bright underline-offset-4 hover:underline"
        >
          Tilbage til serier
        </Link>
      </p>
    </main>
  );
}

function SetFallback() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-5 py-16 sm:px-8 sm:py-24">
      <div className="space-y-4">
        <div className="h-3 w-28 animate-pulse bg-ink-elevated" />
        <div className="h-10 w-80 animate-pulse bg-ink-elevated" />
        <div className="h-5 w-64 animate-pulse bg-ink-elevated" />
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="aspect-[5/7] animate-pulse bg-ink-elevated" />
        ))}
      </div>
    </main>
  );
}
