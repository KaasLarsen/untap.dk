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
  const raw = card?.prices?.eur ?? card?.prices?.eur_foil;
  if (raw == null || raw === "") return null;
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

/** Hide incomplete estimates that would otherwise show as misleading "0 €". */
export function isReliableDeckPriceEstimate(
  estimate: DeckPriceEstimate,
): boolean {
  const cardCount = estimate.pricedCards + estimate.missingCards;
  if (cardCount === 0 || estimate.pricedCards === 0) return false;

  const coverage = estimate.pricedCards / cardCount;
  if (coverage < 0.5) return false;

  // formatEurEstimate rounds to whole euros — avoid "0 €" with gaps.
  if (estimate.total < 0.5) return false;

  return true;
}

export function formatEurEstimate(total: number): string {
  return new Intl.NumberFormat("da-DK", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(total);
}
