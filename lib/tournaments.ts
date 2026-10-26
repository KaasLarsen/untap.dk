import { cacheLife } from "next/cache";
import { estimateDeckPriceEur, formatEurEstimate } from "@/lib/deck-price";
import { parseDecklistText } from "@/lib/decklist-text";
import type { FormatCode } from "@/lib/formats";
import { getFormatBySlug } from "@/lib/formats";
import {
  fetchArchetypeDeckRefs,
  fetchDeckByHrefId,
  fetchEventDeckRefs,
  fetchFormatEvents,
  fetchFormatMetagame,
  fetchLatestDecksFromMtgTop8,
  hydrateDeckRef,
  type DeckRef,
  type FormatEvent,
  type MetagameArchetype,
} from "@/lib/mtgtop8";
import { getCardByName, type ScryfallCard } from "@/lib/scryfall";

export interface TournamentDeckCard {
  name: string;
  quantity: number;
  is_sideboard: boolean;
}

export interface TournamentDeck {
  id: string;
  player_name: string;
  rank: string;
  deck_name?: string;
  format: string;
  cards: TournamentDeckCard[];
  tournament_name: string;
  date: string;
}

export type { MetagameArchetype, FormatEvent, DeckRef };
export { parseDecklistText, normalizeCardName } from "@/lib/decklist-text";

const SAMPLE_DECKS: TournamentDeck[] = [
  {
    id: "sample-boros-energy",
    player_name: "Demo Spiller",
    rank: "1",
    deck_name: "Boros Energy",
    format: "MO",
    tournament_name: "untap.dk sample · Modern",
    date: "2026-10-20",
    cards: parseDecklistText(`4 Guide of Souls
4 Amped Raptor
4 Ocelot Pride
4 Goblin Bombardment
4 Galvanic Discharge
4 Sacred Foundry
4 Plains
4 Mountain
4 Inspiring Vantage

Sideboard
2 Wear // Tear
2 Rest in Peace
2 Surgical Extraction`),
  },
];

function toFormatCode(format: string): FormatCode {
  const bySlug = getFormatBySlug(format);
  if (bySlug) return bySlug.code;
  return (format.toUpperCase() as FormatCode) || "MO";
}

export async function getLatestTournamentDecks(
  format: string = "MO",
  _days: number = 14,
): Promise<TournamentDeck[]> {
  "use cache";
  cacheLife("hours");

  const code = toFormatCode(format);

  try {
    const decks = await fetchLatestDecksFromMtgTop8(code, 12);
    if (decks.length > 0) return decks;
  } catch (error) {
    console.error("MTGTop8-fetch fejlede:", error);
  }

  return SAMPLE_DECKS.filter(
    (deck) => deck.format === code || deck.format === "MODERN",
  );
}

export async function getFormatMetagame(
  format: string,
): Promise<MetagameArchetype[]> {
  "use cache";
  cacheLife("hours");

  try {
    return await fetchFormatMetagame(toFormatCode(format));
  } catch (error) {
    console.error("Kunne ikke hente metagame:", error);
    return [];
  }
}

export async function getFormatEvents(format: string): Promise<FormatEvent[]> {
  "use cache";
  cacheLife("hours");

  try {
    return await fetchFormatEvents(toFormatCode(format));
  } catch (error) {
    console.error("Kunne ikke hente events:", error);
    return [];
  }
}

export async function getArchetypeDeckRefs(
  format: string,
  archetypeId: string,
  meta: string,
): Promise<DeckRef[]> {
  "use cache";
  cacheLife("hours");

  try {
    return await fetchArchetypeDeckRefs(
      toFormatCode(format),
      archetypeId,
      meta,
      24,
    );
  } catch (error) {
    console.error("Kunne ikke hente archetype-dæk:", error);
    return [];
  }
}

export async function getEventDecks(
  format: string,
  eventId: string,
): Promise<{ tournamentName: string; date: string; decks: DeckRef[] }> {
  "use cache";
  cacheLife("hours");

  try {
    return await fetchEventDeckRefs(toFormatCode(format), eventId);
  } catch (error) {
    console.error("Kunne ikke hente event-dæk:", error);
    return { tournamentName: "Ukendt turnering", date: "", decks: [] };
  }
}

export async function getTournamentDeckById(
  id: string,
  format: string = "MO",
): Promise<TournamentDeck | null> {
  "use cache";
  cacheLife("hours");

  if (id.startsWith("sample-")) {
    return SAMPLE_DECKS.find((deck) => deck.id === id) ?? null;
  }

  const fromDirect = await fetchDeckByHrefId(id, toFormatCode(format));
  if (fromDirect) return fromDirect;

  const decks = await getLatestTournamentDecks(format);
  return decks.find((deck) => deck.id === id) ?? null;
}

export async function hydrateDeckRefs(
  refs: DeckRef[],
  limit = 12,
): Promise<TournamentDeck[]> {
  "use cache";
  cacheLife("hours");

  const decks: TournamentDeck[] = [];
  for (const ref of refs.slice(0, limit)) {
    try {
      const deck = await hydrateDeckRef(ref);
      if (deck) decks.push(deck);
    } catch (error) {
      console.error(`Kunne ikke hydrate deck ${ref.deckId}:`, error);
    }
  }
  return decks;
}

export type ArchetypePriceEstimate = {
  total: number;
  formatted: string;
  sampleCount: number;
};

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
}

async function resolveCardsForPricing(
  names: string[],
): Promise<Map<string, ScryfallCard | null>> {
  const unique = [...new Set(names)];
  const results = await Promise.all(
    unique.map(async (name) => {
      const card = await getCardByName(name);
      return [name, card] as const;
    }),
  );
  return new Map(results);
}

/**
 * Rough archetype paper cost from the median of a few recent decklists
 * (Scryfall EUR mid).
 */
export async function getArchetypePriceEstimate(
  format: string,
  archetypeId: string,
  meta: string,
  sampleSize = 3,
): Promise<ArchetypePriceEstimate | null> {
  "use cache";
  cacheLife("hours");

  try {
    const refs = await getArchetypeDeckRefs(format, archetypeId, meta);
    if (refs.length === 0) return null;

    const decks = await hydrateDeckRefs(refs, sampleSize);
    if (decks.length === 0) return null;

    const totals: number[] = [];
    for (const deck of decks) {
      const cards = await resolveCardsForPricing(
        deck.cards.map((card) => card.name),
      );
      const estimate = estimateDeckPriceEur(deck.cards, cards);
      if (estimate.pricedCards > 0) {
        totals.push(estimate.total);
      }
    }

    if (totals.length === 0) return null;

    const total = median(totals);
    return {
      total,
      formatted: formatEurEstimate(total),
      sampleCount: totals.length,
    };
  } catch (error) {
    console.error("Kunne ikke estimere archetype-pris:", error);
    return null;
  }
}
