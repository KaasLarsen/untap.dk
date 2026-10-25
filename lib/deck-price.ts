import type { ScryfallCard } from "@/lib/scryfall";

export type DeckPriceEstimate = {
  currency: "EUR";
  /** Sum of known Scryfall EUR prices × quantities. */
  total: number;
  /** Cards with a usable EUR price. */
  pricedCards: number;
  /** Cards missing EUR price on Scryfall. */
  missingCards: number;
};

type PricedEntry = {
  name: string;
  quantity: number;
};

function parseEur(card: ScryfallCard | null | undefined): number | null {
  const raw = card?.prices?.eur;
  if (!raw) return null;
  const value = Number.parseFloat(raw);
  return Number.isFinite(value) ? value : null;
}

/**
 * Rough paper cost from Scryfall EUR mid prices (main + sideboard).
 */
export function estimateDeckPriceEur(
  entries: PricedEntry[],
  cards: Map<string, ScryfallCard | null>,
): DeckPriceEstimate {
  let total = 0;
  let pricedCards = 0;
  let missingCards = 0;

  for (const entry of entries) {
    const unit = parseEur(cards.get(entry.name));
    if (unit == null) {
      missingCards += entry.quantity;
      continue;
    }
    total += unit * entry.quantity;
    pricedCards += entry.quantity;
  }

  return {
    currency: "EUR",
    total,
    pricedCards,
    missingCards,
  };
}

export function formatEurEstimate(total: number): string {
  return new Intl.NumberFormat("da-DK", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(total);
}
