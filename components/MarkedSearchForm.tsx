"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { formatEurPriceOrDash } from "@/lib/market-price";
import type { CardPrintSummary } from "@/lib/scryfall";

type MarkedSearchFormProps = {
  q: string;
  tab: "kort" | "serier";
};

type Step = "names" | "prints";

const DEBOUNCE_MS = 200;

export function MarkedSearchForm({ q, tab }: MarkedSearchFormProps) {
  const router = useRouter();
  const listboxId = useId();
  const [value, setValue] = useState(q);
  const [step, setStep] = useState<Step>("names");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [prints, setPrints] = useState<CardPrintSummary[]>([]);
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const blurTimer = useRef<number | null>(null);
  const autocompleteAbortRef = useRef<AbortController | null>(null);
  const printsAbortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (tab !== "kort" || step !== "names") {
      autocompleteAbortRef.current?.abort();
      return;
    }

    const trimmed = value.trim();
    if (trimmed.length < 2 || /[:"()<>={}]/.test(trimmed)) {
      autocompleteAbortRef.current?.abort();
      return;
    }

    const timer = window.setTimeout(() => {
      autocompleteAbortRef.current?.abort();
      const controller = new AbortController();
      autocompleteAbortRef.current = controller;
      setLoading(true);

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
          if (!controller.signal.aborted) setLoading(false);
        });
    }, DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timer);
      autocompleteAbortRef.current?.abort();
    };
  }, [value, tab, step]);

  function clearBlurTimer() {
    if (blurTimer.current != null) {
      window.clearTimeout(blurTimer.current);
      blurTimer.current = null;
    }
  }

  function resetToNamesStep() {
    setStep("names");
    setPrints([]);
    setSelectedName(null);
    setActiveIndex(-1);
  }

  function goToSearch(nextQuery: string, nextTab: "kort" | "serier" = tab) {
    const trimmed = nextQuery.trim();
    const params = new URLSearchParams();
    params.set("tab", nextTab);
    if (trimmed) params.set("q", trimmed);
    setOpen(false);
    setSuggestions([]);
    resetToNamesStep();
    router.push(`/marked?${params.toString()}`);
  }

  function goToCard(id: string) {
    setOpen(false);
    setSuggestions([]);
    resetToNamesStep();
    router.push(`/marked/kort/${encodeURIComponent(id)}`);
  }

  function loadPrints(name: string) {
    autocompleteAbortRef.current?.abort();
    printsAbortRef.current?.abort();
    const controller = new AbortController();
    printsAbortRef.current = controller;
    setValue(name);
    setSelectedName(name);
    setStep("prints");
    setPrints([]);
    setActiveIndex(-1);
    setOpen(true);
    setLoading(true);

    fetch(`/api/cards/prints?q=${encodeURIComponent(name)}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("prints failed");
        const body = (await response.json()) as { data?: CardPrintSummary[] };
        if (controller.signal.aborted) return;
        const next = body.data ?? [];
        setPrints(next);
        setActiveIndex(next.length > 0 ? 0 : -1);
        setOpen(true);
        setLoading(false);
        if (next.length === 0) {
          // Exact name with no print hits — fall back to search results.
          goToSearch(name, "kort");
        }
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        setPrints([]);
        setLoading(false);
        goToSearch(name, "kort");
      });
  }

  function selectSuggestion(name: string) {
    loadPrints(name);
  }

  function selectPrint(print: CardPrintSummary) {
    goToCard(print.id);
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (tab !== "kort") {
      goToSearch(value);
      return;
    }

    if (step === "prints" && activeIndex >= 0 && prints[activeIndex]) {
      selectPrint(prints[activeIndex]);
      return;
    }

    if (step === "names" && activeIndex >= 0 && suggestions[activeIndex]) {
      selectSuggestion(suggestions[activeIndex]);
      return;
    }

    goToSearch(value);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    const options = step === "prints" ? prints : suggestions;

    if (event.key === "Escape") {
      event.preventDefault();
      if (step === "prints") {
        resetToNamesStep();
        setOpen(suggestions.length > 0);
        return;
      }
      setOpen(false);
      setActiveIndex(-1);
      return;
    }

    if (!open || options.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % options.length);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) =>
        index <= 0 ? options.length - 1 : index - 1,
      );
    }
  }

  const canSuggestNames =
    tab === "kort" &&
    step === "names" &&
    value.trim().length >= 2 &&
    !/[:"()<>={}]/.test(value.trim());
  const showNames = canSuggestNames && open && suggestions.length > 0;
  const showPrints = tab === "kort" && step === "prints" && open;
  const showList = showNames || showPrints;

  return (
    <form
      onSubmit={onSubmit}
      className="mt-10 flex w-full flex-col gap-4"
      role="search"
    >
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Søgetype">
        <TabLink active={tab === "kort"} href={tabHref("kort", value)}>
          Kort
        </TabLink>
        <TabLink active={tab === "serier"} href={tabHref("serier", value)}>
          Serier
        </TabLink>
      </div>

      <div className="relative flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <label className="sr-only" htmlFor="marked-q">
          {tab === "serier" ? "Søg efter serie" : "Søg efter kort"}
        </label>
        <div className="relative min-w-0 flex-1">
          <input
            id="marked-q"
            name="q"
            type="search"
            value={value}
            onChange={(event) => {
              const next = event.target.value;
              setValue(next);
              resetToNamesStep();
              if (next.trim().length < 2 || /[:"()<>={}]/.test(next.trim())) {
                setSuggestions([]);
                setOpen(false);
                setLoading(false);
              } else {
                setOpen(true);
              }
            }}
            onKeyDown={onKeyDown}
            onFocus={() => {
              clearBlurTimer();
              if (step === "prints" || suggestions.length > 0) setOpen(true);
            }}
            onBlur={() => {
              clearBlurTimer();
              blurTimer.current = window.setTimeout(() => setOpen(false), 120);
            }}
            placeholder={
              tab === "serier"
                ? "Fx Modern Horizons, mh3…"
                : "Fx Force of Negation…"
            }
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            role="combobox"
            aria-expanded={showList}
            aria-controls={listboxId}
            aria-autocomplete="list"
            aria-activedescendant={
              showList && activeIndex >= 0
                ? `${listboxId}-option-${activeIndex}`
                : undefined
            }
            className="min-h-12 w-full border border-line bg-ink-elevated/80 px-4 text-base text-parchment outline-none transition-[border-color,box-shadow] placeholder:text-parchment-muted/70 focus:border-accent/50 focus:shadow-[0_0_0_1px_color-mix(in_srgb,var(--accent)_35%,transparent)]"
          />

          {showNames ? (
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
                      onClick={() => selectSuggestion(name)}
                    >
                      {name}
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : null}

          {showPrints ? (
            <ul
              id={listboxId}
              role="listbox"
              aria-label={`Serier for ${selectedName ?? "kort"}`}
              className="absolute left-0 right-0 top-full z-20 mt-1 max-h-80 overflow-auto border border-line bg-ink-elevated py-1 shadow-[0_16px_40px_-24px_rgba(11,18,32,0.45)]"
            >
              <li role="presentation" className="border-b border-line px-4 py-2">
                <button
                  type="button"
                  className="text-left text-xs text-parchment-muted transition-colors hover:text-parchment"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    resetToNamesStep();
                    setOpen(suggestions.length > 0);
                  }}
                >
                  ← Tilbage til navneforslag
                </button>
                <p className="mt-1 text-sm text-parchment">
                  Vælg serie for{" "}
                  <span className="text-accent-bright">
                    {selectedName ?? value}
                  </span>
                </p>
              </li>
              {loading && prints.length === 0 ? (
                <li className="px-4 py-3 text-sm text-parchment-muted">
                  Henter serier…
                </li>
              ) : null}
              {prints.map((print, index) => {
                const active = index === activeIndex;
                return (
                  <li key={print.id} role="presentation">
                    <button
                      id={`${listboxId}-option-${index}`}
                      type="button"
                      role="option"
                      aria-selected={active}
                      className={
                        active
                          ? "flex w-full items-baseline justify-between gap-3 px-4 py-2.5 text-left text-sm text-parchment bg-accent/10"
                          : "flex w-full items-baseline justify-between gap-3 px-4 py-2.5 text-left text-sm text-parchment transition-colors hover:bg-ink-soft"
                      }
                      onMouseDown={(event) => event.preventDefault()}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => selectPrint(print)}
                    >
                      <span className="min-w-0">
                        <span className="block truncate">
                          {print.set_name}{" "}
                          <span className="uppercase tracking-wide text-parchment-muted">
                            ({print.set})
                          </span>
                        </span>
                        <span className="text-xs text-parchment-muted">
                          #{print.collector_number}
                        </span>
                      </span>
                      <span className="shrink-0 tabular-nums text-parchment">
                        {formatEurPriceOrDash(print)}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>
        <button
          type="submit"
          className="min-h-12 shrink-0 border border-accent/40 bg-accent/15 px-6 text-sm font-medium tracking-wide text-accent-bright transition-colors hover:bg-accent/25"
        >
          Søg
        </button>
      </div>

      <p className="text-sm text-parchment-muted">
        {tab === "serier"
          ? "Søg på serienavn eller set-kode. Priser er EUR mid."
          : loading
            ? step === "prints"
              ? "Henter serier…"
              : "Henter kortforslag…"
            : step === "prints"
              ? "Vælg den serie, du vil se prisen for."
              : "Begynd at skrive — vi foreslår kortnavne. Vælg et navn for at se serier."}
      </p>
    </form>
  );
}

function tabHref(tab: "kort" | "serier", q: string): string {
  const params = new URLSearchParams();
  params.set("tab", tab);
  if (q.trim()) params.set("q", q.trim());
  return `/marked?${params.toString()}`;
}

function TabLink({
  active,
  href,
  children,
}: {
  active: boolean;
  href: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      role="tab"
      aria-selected={active}
      className={
        active
          ? "border border-accent/50 bg-accent/15 px-3 py-1.5 text-sm text-accent-bright"
          : "border border-line px-3 py-1.5 text-sm text-parchment-muted transition-colors hover:border-line hover:text-parchment"
      }
    >
      {children}
    </a>
  );
}
