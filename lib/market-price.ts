import type { ScryfallCard } from "@/lib/scryfall";

export function parseEurPrice(
  card: Pick<ScryfallCard, "prices"> | null | undefined,
): number | null {
  const raw = card?.prices?.eur;
  if (raw == null || raw === "") return null;
  const value = Number.parseFloat(raw);
  return Number.isFinite(value) ? value : null;
}

/** Market display — keep cents for single-card prices. */
export function formatEurPrice(total: number): string {
  return new Intl.NumberFormat("da-DK", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(total);
}

export function formatEurPriceOrDash(
  card: Pick<ScryfallCard, "prices"> | null | undefined,
): string {
  const value = parseEurPrice(card);
  return value == null ? "—" : formatEurPrice(value);
}

export function rarityLabelDa(rarity: string): string {
  switch (rarity) {
    case "mythic":
      return "Mythisk";
    case "rare":
      return "Rare";
    case "uncommon":
      return "Uncommon";
    case "common":
      return "Common";
    case "special":
      return "Special";
    case "bonus":
      return "Bonus";
    default:
      return rarity;
  }
}
