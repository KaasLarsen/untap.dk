import type { Metadata } from "next";
import { Suspense } from "react";
import { MarkedPriceLookup } from "@/components/MarkedPriceLookup";
import { isPokewalletConfigured } from "@/lib/pokewallet";

export const metadata: Metadata = {
  title: "Marked",
  description:
    "CardMarket-pristrends for Magic-kort via PokéWallet — søg et kort og se EUR-udviklingen.",
};

type MarkedLookupProps = {
  searchParams: Promise<{ q?: string }>;
};

async function MarkedLookup({ searchParams }: MarkedLookupProps) {
  const params = await searchParams;
  const initialQuery = params.q?.trim() ?? "";

  return (
    <MarkedPriceLookup
      initialQuery={initialQuery}
      initiallyConfigured={isPokewalletConfigured()}
    />
  );
}

function MarkedLookupFallback() {
  return (
    <div className="h-40 animate-pulse border border-line bg-ink-elevated/40" />
  );
}

export default function MarkedPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  return (
    <main className="mx-auto min-h-[70svh] max-w-3xl px-5 py-28 sm:px-8">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
        Marked
      </p>
      <h1 className="mt-4 font-display text-4xl tracking-tight text-parchment sm:text-5xl">
        Pristrends
      </h1>
      <p className="mt-5 max-w-xl text-base leading-relaxed text-parchment-muted sm:text-lg">
        Søg et Magic-kort og se CardMarket EUR-bevægelsen (30 / 7 / 1 dag +
        trend) fra PokéWallet.
      </p>

      <div className="mt-10">
        <Suspense fallback={<MarkedLookupFallback />}>
          <MarkedLookup searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}
