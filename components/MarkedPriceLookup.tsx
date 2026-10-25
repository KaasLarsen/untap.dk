"use client";

import { useEffect, useState, useTransition } from "react";
import { PriceTrendChart } from "@/components/PriceTrendChart";
import type { PricePoint } from "@/lib/pokewallet";

type TrendResponse = {
  configured: boolean;
  query: string;
  cardName: string | null;
  setName: string | null;
  points: PricePoint[];
  error?: string;
  message?: string;
};

const UNAVAILABLE =
  "Prisudvikling er midlertidigt utilgængelig. Prøv igen senere.";

type MarkedPriceLookupProps = {
  /** When set, auto-loads trend for this card — no search UI. */
  lockedQuery: string;
};

export function MarkedPriceLookup({ lockedQuery }: MarkedPriceLookupProps) {
  const [result, setResult] = useState<TrendResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const trimmed = lockedQuery.trim();
    if (trimmed.length < 2) return;

    const controller = new AbortController();

    startTransition(async () => {
      try {
        const response = await fetch(
          `/api/price-trend?q=${encodeURIComponent(trimmed)}`,
          { signal: controller.signal },
        );
        const data = (await response.json()) as TrendResponse;

        if (controller.signal.aborted) return;

        if (!response.ok) {
          setResult(null);
          setError(data.message ?? UNAVAILABLE);
          return;
        }

        setResult(data);
        if (!data.points.length) {
          setError(
            data.cardName
              ? `Fandt “${data.cardName}”, men ingen prisudvikling at vise endnu.`
              : UNAVAILABLE,
          );
        } else {
          setError(null);
        }
      } catch (err) {
        if (controller.signal.aborted) return;
        if (err instanceof DOMException && err.name === "AbortError") return;
        setResult(null);
        setError(UNAVAILABLE);
      }
    });

    return () => controller.abort();
  }, [lockedQuery]);

  const chartTitle = result?.cardName
    ? `${result.cardName}${result.setName ? ` · ${result.setName}` : ""}`
    : "Prisudvikling";

  const showLoading = pending && !result && !error;
  const showError = Boolean(error && !result?.points.length);

  return (
    <section
      aria-labelledby="price-trend-heading"
      className="mt-12 border-t border-line pt-10"
    >
      <h2
        id="price-trend-heading"
        className="font-display text-2xl tracking-tight text-parchment"
      >
        Prisudvikling
      </h2>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-parchment-muted sm:text-base">
        Baseret på markedsgennemsnit de seneste 30 dage.
      </p>

      <div className="mt-8 max-w-3xl">
        {showLoading ? (
          <div
            className="h-56 animate-pulse border border-line bg-ink-elevated/40 sm:h-72"
            aria-hidden
          />
        ) : null}

        {showError ? (
          <p
            role="status"
            className="border border-line bg-ink-elevated/60 px-4 py-3 text-sm text-parchment-muted"
          >
            {error}
          </p>
        ) : null}

        {result?.points.length ? (
          <PriceTrendChart data={result.points} title={chartTitle} />
        ) : null}
      </div>
    </section>
  );
}
