"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  useTransition,
  type FormEvent,
  type KeyboardEvent,
} from "react";
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

const DEBOUNCE_MS = 200;

type MarkedPriceLookupProps = {
  initialQuery?: string;
  initiallyConfigured: boolean;
};

export function MarkedPriceLookup({
  initialQuery = "",
  initiallyConfigured,
}: MarkedPriceLookupProps) {
  const listboxId = useId();
  const [query, setQuery] = useState(initialQuery);
  const [result, setResult] = useState<TrendResponse | null>(null);
  const [error, setError] = useState<string | null>(
    initiallyConfigured
      ? null
      : "Pristrends er midlertidigt utilgængelige.",
  );
  const [pending, startTransition] = useTransition();
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const blurTimer = useRef<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!initiallyConfigured) return;

    const trimmed = query.trim();
    if (trimmed.length < 2) return;

    const timer = window.setTimeout(() => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setLoadingSuggestions(true);

      fetch(`/api/cards/autocomplete?q=${encodeURIComponent(trimmed)}`, {
        signal: controller.signal,
      })
        .then(async (response) => {
          if (!response.ok) throw new Error("autocomplete failed");
          const body = (await response.json()) as { data?: string[] };
          if (controller.signal.aborted) return;
          const next = body.data ?? [];
          setSuggestions(next);
          setActiveIndex(-1);
          setOpen(next.length > 0);
        })
        .catch((error: unknown) => {
          if (error instanceof DOMException && error.name === "AbortError") {
            return;
          }
          setSuggestions([]);
          setOpen(false);
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoadingSuggestions(false);
        });
    }, DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timer);
      abortRef.current?.abort();
    };
  }, [query, initiallyConfigured]);

  function clearBlurTimer() {
    if (blurTimer.current != null) {
      window.clearTimeout(blurTimer.current);
      blurTimer.current = null;
    }
  }

  function lookup(nextQuery: string) {
    const trimmed = nextQuery.trim();
    if (trimmed.length < 2) {
      setError("Søg med mindst 2 tegn.");
      setResult(null);
      return;
    }

    setQuery(trimmed);
    setOpen(false);
    setSuggestions([]);
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
    // Defer so the mount effect does not setState synchronously.
    const frame = window.requestAnimationFrame(() => lookup(trimmed));
    return () => window.cancelAnimationFrame(frame);
    // Run once on mount for shareable ?trend= links.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional mount-only
  }, []);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (activeIndex >= 0 && suggestions[activeIndex]) {
      lookup(suggestions[activeIndex]);
      return;
    }
    lookup(query);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!open || suggestions.length === 0) {
      if (event.key === "Escape") setOpen(false);
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % suggestions.length);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) =>
        index <= 0 ? suggestions.length - 1 : index - 1,
      );
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      setActiveIndex(-1);
    }
  }

  const showList = open && suggestions.length > 0 && initiallyConfigured;
  const chartTitle = result?.cardName
    ? `${result.cardName}${result.setName ? ` · ${result.setName}` : ""}`
    : "Prishistorik (EUR)";

  return (
    <div className="space-y-8">
      <form onSubmit={onSubmit} className="space-y-3">
        <label htmlFor="card-query" className="sr-only">
          Kortnavn
        </label>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
          <div className="relative min-w-0 flex-1">
            <input
              id="card-query"
              type="search"
              name="q"
              value={query}
              onChange={(event) => {
                const next = event.target.value;
                setQuery(next);
                if (next.trim().length < 2) {
                  setSuggestions([]);
                  setOpen(false);
                  setActiveIndex(-1);
                  setLoadingSuggestions(false);
                  abortRef.current?.abort();
                } else {
                  setOpen(true);
                }
              }}
              onKeyDown={onKeyDown}
              onFocus={() => {
                clearBlurTimer();
                if (suggestions.length > 0) setOpen(true);
              }}
              onBlur={() => {
                clearBlurTimer();
                blurTimer.current = window.setTimeout(() => setOpen(false), 120);
              }}
              placeholder="Søg kort — fx Ragavan, Nimble Pilferer"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              disabled={!initiallyConfigured}
              role="combobox"
              aria-expanded={showList}
              aria-controls={listboxId}
              aria-autocomplete="list"
              aria-activedescendant={
                showList && activeIndex >= 0
                  ? `${listboxId}-option-${activeIndex}`
                  : undefined
              }
              className="min-h-12 w-full border border-line bg-ink px-4 py-3 text-parchment placeholder:text-parchment-muted/70 outline-none transition focus:border-accent disabled:cursor-not-allowed disabled:opacity-60"
            />

            {showList ? (
              <ul
                id={listboxId}
                role="listbox"
                aria-label="Kortforslag"
                className="absolute left-0 right-0 top-full z-20 mt-1 max-h-72 overflow-auto border border-line bg-ink-elevated py-1 shadow-[0_16px_40px_-24px_rgba(11,18,32,0.45)]"
              >
                {suggestions.map((name, index) => {
                  const active = index === activeIndex;
                  return (
                    <li key={name} role="presentation">
                      <button
                        id={`${listboxId}-option-${index}`}
                        type="button"
                        role="option"
                        aria-selected={active}
                        className={
                          active
                            ? "flex w-full px-4 py-2.5 text-left text-sm text-parchment bg-accent/10"
                            : "flex w-full px-4 py-2.5 text-left text-sm text-parchment transition-colors hover:bg-ink-soft"
                        }
                        onMouseDown={(event) => event.preventDefault()}
                        onMouseEnter={() => setActiveIndex(index)}
                        onClick={() => lookup(name)}
                      >
                        {name}
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </div>
          <button
            type="submit"
            disabled={pending || !initiallyConfigured}
            className="min-h-12 border border-accent bg-accent/15 px-5 py-3 text-sm font-medium tracking-wide text-accent-bright transition hover:bg-accent/25 disabled:cursor-wait disabled:opacity-60"
          >
            {pending ? "Henter…" : "Vis pris"}
          </button>
        </div>
        {initiallyConfigured ? (
          <p className="text-sm text-parchment-muted">
            {loadingSuggestions
              ? "Henter kortforslag…"
              : "Begynd at skrive — vi foreslår kortnavne."}
          </p>
        ) : null}
      </form>

      <div className="flex flex-wrap gap-2">
        {SUGGESTIONS.map((name) => (
          <button
            key={name}
            type="button"
            disabled={pending || !initiallyConfigured}
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
