import { cacheLife } from "next/cache";

export interface ScryfallCard {
  id: string;
  name: string;
  mana_cost?: string;
  type_line: string;
  oracle_text?: string;
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
    eur?: string;
    usd?: string;
  };
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

/**
 * Søger efter kort baseret på en delvis tekststreng (perfekt til en søgebar).
 */
export async function searchCards(query: string): Promise<ScryfallCard[]> {
  "use cache";
  cacheLife("hours");

  if (!query || query.length < 2) return [];

  try {
    const response = await fetch(
      `${BASE_URL}/cards/search?q=${encodeURIComponent(query)}`,
      { headers: SCRYFALL_HEADERS },
    );

    if (!response.ok) return [];

    const data = (await response.json()) as { data?: ScryfallCard[] };
    return (data.data || []).map(normalizeCard);
  } catch (error) {
    console.error(`Fejl under søgning efter "${query}":`, error);
    return [];
  }
}
