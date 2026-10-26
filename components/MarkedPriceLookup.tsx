"use client";

import { useEffect, useState, useTransition, type FormEvent } from "react";
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

const SUGGESTIONS = [
  "Ragavan, Nimble Pilferer",
  "Force of Will",
  "The One Ring",
  "Sol Ring",
] as const;

type MarkedPriceLookupProps = {
  initialQuery?: string;
  initiallyConfigured: boolean;
};

export function MarkedPriceLookup({
  initialQuery = "",
  initiallyConfigured,
}: MarkedPriceLookupProps) {
  const [query, setQuery] = useState(initialQuery);
  const [result, setResult] = useState<TrendResponse | null>(null);
  const [error, setError] = useState<string | null>(
    initiallyConfigured
      ? null
      : "Pristrends er midlertidigt utilgængelige.",
  );
  const [pending, startTransition] = useTransition();

  function lookup(nextQuery: string) {
    const trimmed = nextQuery.trim();
    if (trimmed.length < 2) {
      setError("Søg med mindst 2 tegn.");
      setResult(null);
      return;
    }

    setQuery(trimmed);
    setError(null);

    startTransition(async () => {
      try {
        const response = await fetch(
          `/api/price-trend?q=${encodeURIComponent(trimmed)}`,
        );
        const data = (await response.json()) as TrendResponse;

        if (!response.ok) {
          setResult(null);
          setError(data.message ?? "Kunne ikke hente prisdata.");
          return;
        }

        setResult(data);
        if (!data.points.length) {
          setError(
            data.cardName
              ? `Fandt “${data.cardName}”, men ingen pristrend at plotte.`
              : `Ingen match for “${trimmed}”.`,
          );
        } else {
          setError(null);
        }
      } catch {
        setResult(null);
        setError("Netværksfejl — prøv igen om lidt.");
      }
    });
  }

  useEffect(() => {
    if (!initiallyConfigured) return;
    const trimmed = initialQuery.trim();
    if (trimmed.length < 2) return;
    lookup(trimmed);
    // Run once on mount for shareable ?q= links.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional mount-only
  }, []);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    lookup(query);
  }

  const chartTitle = result?.cardName
    ? `${result.cardName}${result.setName ? ` · ${result.setName}` : ""}`
    : "Prishistorik (EUR)";

  return (
    <div className="space-y-8">
      <form onSubmit={onSubmit} className="space-y-3">
        <label htmlFor="card-query" className="sr-only">
          Kortnavn
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            id="card-query"
            type="search"
            name="q"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Søg kort — fx Ragavan, Nimble Pilferer"
            autoComplete="off"
            className="w-full flex-1 border border-line bg-ink px-4 py-3 text-parchment placeholder:text-parchment-muted/70 outline-none transition focus:border-accent"
          />
          <button
            type="submit"
            disabled={pending}
            className="border border-accent bg-accent/15 px-5 py-3 text-sm font-medium tracking-wide text-accent-bright transition hover:bg-accent/25 disabled:cursor-wait disabled:opacity-60"
          >
            {pending ? "Henter…" : "Vis pris"}
          </button>
        </div>
      </form>

      <div className="flex flex-wrap gap-2">
        {SUGGESTIONS.map((name) => (
          <button
            key={name}
            type="button"
            disabled={pending}
            onClick={() => lookup(name)}
            className="border border-line bg-ink-elevated px-3 py-1.5 text-xs text-parchment-muted transition hover:border-accent/50 hover:text-parchment disabled:opacity-50"
          >
            {name}
          </button>
        ))}
      </div>

      {error ? (
        <p
          role="status"
          className="border border-line bg-ink/60 px-4 py-3 text-sm text-parchment-muted"
        >
          {error}
        </p>
      ) : null}

      {result?.points.length ? (
        <PriceTrendChart data={result.points} title={chartTitle} />
      ) : null}
    </div>
  );
}
