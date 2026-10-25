import { cacheLife } from "next/cache";

const BASE_URL = "https://archidekt.com/api/decks";
const USER_AGENT = "untap.dk/0.1 (https://untap.dk; contact@untap.dk)";

export type ArchidektCard = {
  name: string;
  quantity: number;
  category: string;
};

export type ArchidektDeck = {
  id: string;
  name: string;
  ownerName: string;
  categories: string[];
  cards: ArchidektCard[];
  grouped: { category: string; cards: ArchidektCard[] }[];
};

type ArchidektApiCategory = {
  name?: string;
  includedInDeck?: boolean;
};

type ArchidektApiCard = {
  quantity?: number;
  categories?: string[] | null;
  card?: {
    displayName?: string;
    oracleCard?: {
      name?: string;
      defaultCategory?: string | null;
    };
  };
};

type ArchidektApiDeck = {
  id?: number | string;
  name?: string;
  owner?: { username?: string } | null;
  categories?: ArchidektApiCategory[] | null;
  cards?: ArchidektApiCard[] | null;
};

const DECK_ID_RE = /^\d+$/;
const DECK_URL_RE = /archidekt\.com\/decks\/(\d+)/i;

/**
 * Accepts a bare Archidekt deck ID or a full deck URL.
 */
export function parseArchidektDeckId(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  if (DECK_ID_RE.test(trimmed)) return trimmed;

  const match = trimmed.match(DECK_URL_RE);
  return match?.[1] ?? null;
}

function resolveCardName(entry: ArchidektApiCard): string | null {
  const name =
    entry.card?.oracleCard?.name?.trim() ||
    entry.card?.displayName?.trim() ||
    "";
  return name || null;
}

function resolveCategory(entry: ArchidektApiCard): string {
  const fromCard = entry.categories?.find((name) => name?.trim());
  if (fromCard?.trim()) return fromCard.trim();

  const fromOracle = entry.card?.oracleCard?.defaultCategory?.trim();
  if (fromOracle) return fromOracle;

  return "Mainboard";
}

function groupCards(
  cards: ArchidektCard[],
  preferredOrder: string[],
): ArchidektDeck["grouped"] {
  const buckets = new Map<string, ArchidektCard[]>();

  for (const card of cards) {
    const list = buckets.get(card.category);
    if (list) list.push(card);
    else buckets.set(card.category, [card]);
  }

  const grouped: ArchidektDeck["grouped"] = [];
  const seen = new Set<string>();

  for (const category of preferredOrder) {
    const list = buckets.get(category);
    if (!list?.length) continue;
    grouped.push({ category, cards: list });
    seen.add(category);
  }

  for (const [category, list] of buckets) {
    if (seen.has(category)) continue;
    grouped.push({ category, cards: list });
  }

  return grouped;
}

function mapArchidektDeck(raw: ArchidektApiDeck, deckId: string): ArchidektDeck {
  const preferredCategories = (raw.categories ?? [])
    .filter((category) => category.includedInDeck !== false)
    .map((category) => category.name?.trim() ?? "")
    .filter(Boolean);

  const cards: ArchidektCard[] = [];

  for (const entry of raw.cards ?? []) {
    const name = resolveCardName(entry);
    const quantity = Number(entry.quantity ?? 0);
    if (!name || !Number.isFinite(quantity) || quantity <= 0) continue;

    cards.push({
      name,
      quantity,
      category: resolveCategory(entry),
    });
  }

  const categories = [
    ...preferredCategories,
    ...cards
      .map((card) => card.category)
      .filter((category) => !preferredCategories.includes(category)),
  ].filter((category, index, all) => all.indexOf(category) === index);

  return {
    id: String(raw.id ?? deckId),
    name: raw.name?.trim() || `Deck ${deckId}`,
    ownerName: raw.owner?.username?.trim() || "Ukendt",
    categories,
    cards,
    grouped: groupCards(cards, preferredCategories),
  };
}

/**
 * Fetches a public Archidekt deck and maps it to a simplified shape.
 */
export async function fetchArchidektDeck(
  deckId: string,
): Promise<ArchidektDeck> {
  "use cache";
  cacheLife("hours");

  const id = deckId.trim();
  if (!DECK_ID_RE.test(id)) {
    throw new Error("Ugyldigt Archidekt deck-ID.");
  }

  const response = await fetch(`${BASE_URL}/${id}/`, {
    headers: {
      Accept: "application/json",
      "User-Agent": USER_AGENT,
    },
  });

  if (response.status === 404) {
    throw new Error("Deck ikke fundet.");
  }

  if (!response.ok) {
    throw new Error(`Archidekt HTTP ${response.status} for deck ${id}`);
  }

  const raw = (await response.json()) as ArchidektApiDeck;
  return mapArchidektDeck(raw, id);
}
