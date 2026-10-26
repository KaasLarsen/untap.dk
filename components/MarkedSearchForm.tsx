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

type MarkedSearchFormProps = {
  q: string;
  tab: "kort" | "serier";
};

const DEBOUNCE_MS = 200;

export function MarkedSearchForm({ q, tab }: MarkedSearchFormProps) {
  const router = useRouter();
  const listboxId = useId();
  const [value, setValue] = useState(q);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const blurTimer = useRef<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    setValue(q);
  }, [q]);

  useEffect(() => {
    if (tab !== "kort") {
      setSuggestions([]);
      setOpen(false);
      setLoading(false);
      return;
    }

    const trimmed = value.trim();
    if (trimmed.length < 2 || /[:"()<>={}]/.test(trimmed)) {
      setSuggestions([]);
      setOpen(false);
      setLoading(false);
      abortRef.current?.abort();
      return;
    }

    const timer = window.setTimeout(() => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
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
      abortRef.current?.abort();
    };
  }, [value, tab]);

  function clearBlurTimer() {
    if (blurTimer.current != null) {
      window.clearTimeout(blurTimer.current);
      blurTimer.current = null;
    }
  }

  function goToSearch(nextQuery: string, nextTab: "kort" | "serier" = tab) {
    const trimmed = nextQuery.trim();
    const params = new URLSearchParams();
    params.set("tab", nextTab);
    if (trimmed) params.set("q", trimmed);
    setOpen(false);
    setSuggestions([]);
    router.push(`/marked?${params.toString()}`);
  }

  function selectSuggestion(name: string) {
    setValue(name);
    goToSearch(name, "kort");
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (tab === "kort" && activeIndex >= 0 && suggestions[activeIndex]) {
      selectSuggestion(suggestions[activeIndex]);
      return;
    }
    goToSearch(value);
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

  const showList = tab === "kort" && open && suggestions.length > 0;

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
              setValue(event.target.value);
              setOpen(true);
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
                      onClick={() => selectSuggestion(name)}
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
          className="min-h-12 shrink-0 border border-accent/40 bg-accent/15 px-6 text-sm font-medium tracking-wide text-accent-bright transition-colors hover:bg-accent/25"
        >
          Søg
        </button>
      </div>

      <p className="text-sm text-parchment-muted">
        {tab === "serier"
          ? "Søg på serienavn eller set-kode. Priser er EUR mid."
          : loading
            ? "Henter kortforslag…"
            : "Begynd at skrive — vi foreslår kortnavne. Du kan også søge med set:mh3."}
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
