import { cacheLife } from "next/cache";

export interface ScryfallCard {
  id: string;
  name: string;
  mana_cost?: string;
  type_line: string;
  oracle_text?: string;
  set: string;
  set_name: string;
  rarity: string;
  collector_number: string;
  released_at?: string;
  image_uris?: {
    small: string;
    normal: string;
    large: string;
    png: string;
  };
  card_faces?: Array<{
    name?: string;
    image_uris?: ScryfallCard["image_uris"];
  }>;
  prices: {
    eur?: string | null;
    eur_foil?: string | null;
    usd?: string | null;
  };
}

export interface ScryfallSet {
  id: string;
  code: string;
  name: string;
  set_type: string;
  card_count: number;
  released_at?: string | null;
  digital: boolean;
  icon_svg_uri?: string;
}

const BASE_URL = "https://api.scryfall.com";

const SCRYFALL_HEADERS = {
  Accept: "application/json",
  "User-Agent": "untap.dk/0.1 (https://untap.dk; contact@untap.dk)",
} as const;

function normalizeCard(data: ScryfallCard): ScryfallCard {
  if (data.image_uris) return data;

  const faceImage = data.card_faces?.[0]?.image_uris;
  if (!faceImage) return data;

  return { ...data, image_uris: faceImage };
}

function hasPaperEur(card: ScryfallCard | null | undefined): boolean {
  const eur = card?.prices?.eur;
  const foil = card?.prices?.eur_foil;
  return (eur != null && eur !== "") || (foil != null && foil !== "");
}

function parsePriceString(raw: string | null | undefined): number | null {
  if (raw == null || raw === "") return null;
  const value = Number.parseFloat(raw);
  return Number.isFinite(value) ? value : null;
}

/**
 * Scryfall `/cards/named` often returns an online-only / promo printing with
 * null paper EUR. Prefer the cheapest printing that has eur or eur_foil so
 * deck estimates are not under-counted into "0 €".
 */
async function cheapestPaperEur(
  cardName: string,
): Promise<string | null> {
  "use cache";
  cacheLife("days");

  const query = `!"${cardName.replaceAll('"', "")}" (eur>0 OR eur_foil>0)`;
  const params = new URLSearchParams({
    q: query,
    unique: "prints",
    order: "eur",
    dir: "asc",
  });

  const response = await fetch(`${BASE_URL}/cards/search?${params}`, {
    headers: SCRYFALL_HEADERS,
  });

  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`Scryfall API fejl: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as { data?: ScryfallCard[] };
  let best: number | null = null;

  for (const print of data.data ?? []) {
    for (const raw of [print.prices?.eur, print.prices?.eur_foil]) {
      const value = parsePriceString(raw);
      if (value == null) continue;
      if (best == null || value < best) best = value;
    }
  }

  return best == null ? null : best.toFixed(2);
}

async function withPaperEur(card: ScryfallCard): Promise<ScryfallCard> {
  if (hasPaperEur(card)) {
    // Prefer non-foil EUR when present; copy foil into eur only when needed.
    if (card.prices?.eur) return card;
    return {
      ...card,
      prices: {
        ...card.prices,
        eur: card.prices.eur_foil,
      },
    };
  }

  try {
    const eur = await cheapestPaperEur(card.name);
    if (!eur) return card;
    return {
      ...card,
      prices: {
        ...card.prices,
        eur,
      },
    };
  } catch (error) {
    console.error(`Kunne ikke backfille EUR for "${card.name}":`, error);
    return card;
  }
}

async function fetchNamedCard(cardName: string): Promise<ScryfallCard | null> {
  const exact = await fetch(
    `${BASE_URL}/cards/named?exact=${encodeURIComponent(cardName)}`,
    { headers: SCRYFALL_HEADERS },
  );

  if (exact.ok) {
    return normalizeCard((await exact.json()) as ScryfallCard);
  }

  if (exact.status === 404) {
    const fuzzy = await fetch(
      `${BASE_URL}/cards/named?fuzzy=${encodeURIComponent(cardName)}`,
      { headers: SCRYFALL_HEADERS },
    );

    if (fuzzy.status === 404) return null;
    if (!fuzzy.ok) {
      throw new Error(`Scryfall API fejl: ${fuzzy.status} ${fuzzy.statusText}`);
    }

    return normalizeCard((await fuzzy.json()) as ScryfallCard);
  }

  throw new Error(`Scryfall API fejl: ${exact.status} ${exact.statusText}`);
}

/**
 * Henter data for et specifikt kort baseret på det nøjagtige navn.
 * Scryfall API kræver ikke API-nøgle, men vi skal respektere deres rate-limit (max 10 kald pr. sekund).
 */
export async function getCardByName(
  cardName: string,
): Promise<ScryfallCard | null> {
  "use cache";
  cacheLife("days");

  try {
    const card = await fetchNamedCard(cardName);
    if (!card) return null;
    return withPaperEur(card);
  } catch (error) {
    // Do not cache transient failures as null — rethrow rate limits / 5xx.
    const message = error instanceof Error ? error.message : String(error);
    if (/429|rate limit|50\d/i.test(message)) throw error;
    console.error(`Kunne ikke hente kortet "${cardName}":`, error);
    return null;
  }
}

type CollectionResponse = {
  data?: ScryfallCard[];
  not_found?: Array<{ name?: string }>;
};

const COLLECTION_CHUNK = 75;

/**
 * Batch-lookup by oracle name via `/cards/collection` (fewer rate-limit hits),
 * then backfill paper EUR from another printing when the default has none.
 * Returns a plain object so `"use cache"` can serialize the result.
 */
export async function getCardsByNames(
  names: string[],
): Promise<Record<string, ScryfallCard | null>> {
  "use cache";
  cacheLife("days");

  const unique = [...new Set(names.map((name) => name.trim()).filter(Boolean))];
  const result: Record<string, ScryfallCard | null> = {};

  for (let i = 0; i < unique.length; i += COLLECTION_CHUNK) {
    const chunk = unique.slice(i, i + COLLECTION_CHUNK);
    const response = await fetch(`${BASE_URL}/cards/collection`, {
      method: "POST",
      headers: {
        ...SCRYFALL_HEADERS,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        identifiers: chunk.map((name) => ({ name })),
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Scryfall collection fejl: ${response.status} ${response.statusText}`,
      );
    }

    const payload = (await response.json()) as CollectionResponse;
    const byLower = new Map<string, ScryfallCard>();

    for (const card of payload.data ?? []) {
      const normalized = normalizeCard(card);
      byLower.set(normalized.name.toLowerCase(), normalized);
      // Split cards may be requested as either face; keep face keys too.
      for (const face of normalized.card_faces ?? []) {
        if (face.name) byLower.set(face.name.toLowerCase(), normalized);
      }
    }

    for (const name of chunk) {
      let match = byLower.get(name.toLowerCase()) ?? null;
      if (!match) {
        // Collection is exact-oracle; fall back to named/fuzzy for MTGTop8 quirks.
        try {
          match = await fetchNamedCard(name);
        } catch (error) {
          console.error(`Kunne ikke hente kortet "${name}":`, error);
          match = null;
        }
      }
      result[name] = match ? await withPaperEur(match) : null;
    }

    // Soft pacing between chunks (Scryfall ~10 req/s).
    if (i + COLLECTION_CHUNK < unique.length) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  return result;
}

export async function getCardById(id: string): Promise<ScryfallCard | null> {
  "use cache";
  cacheLife("days");

  try {
    const response = await fetch(`${BASE_URL}/cards/${encodeURIComponent(id)}`, {
      headers: SCRYFALL_HEADERS,
    });

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`Scryfall API fejl: ${response.statusText}`);
    }

    const data = (await response.json()) as ScryfallCard;
    return normalizeCard(data);
  } catch (error) {
    console.error(`Kunne ikke hente kort-id "${id}":`, error);
    return null;
  }
}

export type SearchCardsOptions = {
  /** Scryfall unique mode. Default: cards */
  unique?: "cards" | "art" | "prints";
  /** Scryfall sort order. Default: name */
  order?: "name" | "released" | "set" | "eur" | "usd" | "rarity";
  /** Max results to return (Scryfall pages are 175). */
  limit?: number;
};

/**
 * Søger efter kort baseret på en delvis tekststreng (perfekt til en søgebar).
 * Understøtter fuld Scryfall-syntax, fx `set:mh3` eller `e:dmu t:creature`.
 * Almindelige navne uden operatorer søges som navnematch (`name:…`).
 */
export async function searchCards(
  query: string,
  options: SearchCardsOptions = {},
): Promise<ScryfallCard[]> {
  "use cache";
  cacheLife("hours");

  if (!query || query.trim().length < 2) return [];

  const unique = options.unique ?? "cards";
  const order = options.order ?? "name";
  const limit = options.limit ?? 24;
  const scryfallQuery = toScryfallSearchQuery(query.trim());

  try {
    const params = new URLSearchParams({
      q: scryfallQuery,
      unique,
      order,
    });
    const response = await fetch(`${BASE_URL}/cards/search?${params}`, {
      headers: SCRYFALL_HEADERS,
    });

    if (!response.ok) return [];

    const data = (await response.json()) as { data?: ScryfallCard[] };
    return (data.data || []).slice(0, limit).map(normalizeCard);
  } catch (error) {
    console.error(`Fejl under søgning efter "${query}":`, error);
    return [];
  }
}

/** True when the query looks like Scryfall search syntax, not a plain card name. */
function looksLikeScryfallSyntax(query: string): boolean {
  return /[:"()<>={}]/.test(query);
}

/**
 * Plain names → `name:"…"`. Keeps full Scryfall syntax untouched.
 */
export function toScryfallSearchQuery(query: string): string {
  const trimmed = query.trim();
  if (!trimmed) return trimmed;
  if (looksLikeScryfallSyntax(trimmed)) return trimmed;
  return `name:"${trimmed.replaceAll('"', "")}"`;
}

/**
 * Kortnavnsforslag til typeahead (Scryfall /cards/autocomplete).
 */
export async function autocompleteCardNames(
  query: string,
  limit = 12,
): Promise<string[]> {
  "use cache";
  cacheLife("hours");

  const q = query.trim();
  if (q.length < 2 || looksLikeScryfallSyntax(q)) return [];

  try {
    const params = new URLSearchParams({ q });
    const response = await fetch(
      `${BASE_URL}/cards/autocomplete?${params}`,
      { headers: SCRYFALL_HEADERS },
    );

    if (!response.ok) return [];

    const data = (await response.json()) as { data?: string[] };
    return (data.data ?? []).slice(0, limit);
  } catch (error) {
    console.error(`Fejl under autocomplete for "${query}":`, error);
    return [];
  }
}

export async function getAllSets(): Promise<ScryfallSet[]> {
  "use cache";
  cacheLife("days");

  try {
    const response = await fetch(`${BASE_URL}/sets`, {
      headers: SCRYFALL_HEADERS,
    });

    if (!response.ok) {
      throw new Error(`Scryfall API fejl: ${response.statusText}`);
    }

    const data = (await response.json()) as { data?: ScryfallSet[] };
    return data.data || [];
  } catch (error) {
    console.error("Kunne ikke hente serier fra Scryfall:", error);
    return [];
  }
}

export async function getSetByCode(code: string): Promise<ScryfallSet | null> {
  "use cache";
  cacheLife("days");

  try {
    const response = await fetch(
      `${BASE_URL}/sets/${encodeURIComponent(code.toLowerCase())}`,
      { headers: SCRYFALL_HEADERS },
    );

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`Scryfall API fejl: ${response.statusText}`);
    }

    return (await response.json()) as ScryfallSet;
  } catch (error) {
    console.error(`Kunne ikke hente serien "${code}":`, error);
    return null;
  }
}

function setSearchRank(set: ScryfallSet, q: string): number {
  const name = set.name.toLowerCase();
  const code = set.code.toLowerCase();

  if (code === q) return 0;
  if (name === q) return 1;
  if (code.startsWith(q)) return 2;
  if (name.startsWith(q)) return 3;
  if (code.includes(q)) return 4;
  if (name.includes(q)) return 5;
  return 99;
}

/**
 * Filtrerer Scryfall-serier lokalt på navn eller set-kode.
 * Exact set-kode (fx mh3) rangeres over delvise hits som smh3.
 */
export async function searchSets(
  query: string,
  limit = 24,
): Promise<ScryfallSet[]> {
  "use cache";
  cacheLife("days");

  const q = query.trim().toLowerCase();
  if (q.length < 1) return [];

  const sets = await getAllSets();
  return sets
    .filter((set) => {
      if (set.digital) return false;
      const name = set.name.toLowerCase();
      const code = set.code.toLowerCase();
      return name.includes(q) || code.includes(q);
    })
    .sort((a, b) => {
      const rankDiff = setSearchRank(a, q) - setSearchRank(b, q);
      if (rankDiff !== 0) return rankDiff;
      const dateA = a.released_at || "";
      const dateB = b.released_at || "";
      return dateB.localeCompare(dateA);
    })
    .slice(0, limit);
}

export async function getCardsInSet(
  setCode: string,
  limit = 48,
): Promise<ScryfallCard[]> {
  return searchCards(`e:${setCode}`, {
    unique: "prints",
    order: "set",
    limit,
  });
}
