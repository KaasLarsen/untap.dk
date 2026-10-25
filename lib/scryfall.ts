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
    const response = await fetch(
      `${BASE_URL}/cards/named?exact=${encodeURIComponent(cardName)}`,
      { headers: SCRYFALL_HEADERS },
    );

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`Scryfall API fejl: ${response.statusText}`);
    }

    const data = (await response.json()) as ScryfallCard;
    return normalizeCard(data);
  } catch (error) {
    console.error(`Kunne ikke hente kortet "${cardName}":`, error);
    return null;
  }
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

  try {
    const params = new URLSearchParams({
      q: query.trim(),
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

/**
 * Filtrerer Scryfall-serier lokalt på navn eller set-kode.
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
      return name.includes(q) || code.includes(q) || code === q;
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
