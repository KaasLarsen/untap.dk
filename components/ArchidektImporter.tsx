"use client";

import { useState, type FormEvent } from "react";
import {
  importArchidektDeck,
  type ImportArchidektResult,
} from "@/lib/archidekt-actions";
import type { ArchidektDeck } from "@/lib/archidekt";

export function ArchidektImporter() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deck, setDeck] = useState<ArchidektDeck | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const result: ImportArchidektResult = await importArchidektDeck(input);

    if (!result.ok) {
      setDeck(null);
      setError(result.error);
      setLoading(false);
      return;
    }

    setDeck(result.deck);
    setLoading(false);
  }

  return (
    <div className="space-y-10">
      <form onSubmit={onSubmit} className="space-y-4">
        <label className="block space-y-2">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-parchment-muted">
            Archidekt URL eller deck-ID
          </span>
          <input
            type="text"
            name="archidekt"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="https://archidekt.com/decks/500000/… eller 500000"
            autoComplete="off"
            spellCheck={false}
            className="w-full border border-line bg-ink-elevated px-4 py-3 text-sm text-parchment outline-none transition-colors placeholder:text-parchment-muted/50 focus:border-accent/60"
          />
        </label>

        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="inline-flex items-center justify-center border border-accent/40 bg-accent/15 px-5 py-2.5 text-sm font-medium text-accent-bright transition-colors hover:bg-accent/25 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? "Henter…" : "Hent deck"}
        </button>
      </form>

      {error ? (
        <p
          role="alert"
          className="border border-line bg-ink-elevated px-4 py-3 text-sm text-parchment-muted"
        >
          {error}
        </p>
      ) : null}

      {deck ? <DeckResult deck={deck} /> : null}
    </div>
  );
}

function DeckResult({ deck }: { deck: ArchidektDeck }) {
  const total = deck.cards.reduce((sum, card) => sum + card.quantity, 0);

  return (
    <article className="animate-fade-rise w-full rounded-2xl border border-line bg-ink-elevated p-6 text-parchment shadow-[0_24px_80px_-40px_rgba(0,0,0,0.9)] sm:p-8">
      <header className="mb-8 space-y-2 border-b border-line pb-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">
          Archidekt
        </p>
        <h2 className="font-display text-3xl tracking-tight text-parchment">
          {deck.name}
        </h2>
        <p className="text-sm text-parchment-muted">
          af {deck.ownerName}
          <span className="text-parchment-muted/50"> · </span>
          <span className="font-mono tabular-nums">{total} kort</span>
        </p>
      </header>

      <div className="space-y-8">
        {deck.grouped.map((group) => {
          const groupTotal = group.cards.reduce(
            (sum, card) => sum + card.quantity,
            0,
          );

          return (
            <section key={group.category} className="space-y-3">
              <div className="flex items-baseline justify-between border-b border-line pb-2">
                <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-parchment-muted">
                  {group.category}
                </h3>
                <span className="font-mono text-xs tabular-nums text-parchment-muted/70">
                  {groupTotal}
                </span>
              </div>
              <ul className="space-y-0.5">
                {group.cards.map((card) => (
                  <li
                    key={`${group.category}-${card.name}`}
                    className="flex items-baseline gap-3 px-1 py-1.5 text-sm transition-colors hover:bg-parchment/5"
                  >
                    <span className="w-7 shrink-0 font-mono text-xs tabular-nums text-accent">
                      {card.quantity}
                    </span>
                    <span className="text-parchment">{card.name}</span>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </article>
  );
}
