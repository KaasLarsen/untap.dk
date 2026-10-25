import { cacheLife } from "next/cache";

export interface TournamentDeckCard {
  name: string;
  quantity: number;
  is_sideboard: boolean;
}

export interface TournamentDeck {
  id: string;
  player_name: string;
  rank: number;
  deck_name?: string;
  format: string;
  cards: TournamentDeckCard[];
  tournament_name: string;
  date: string;
}

type SpicerackDecklistCard = {
  name?: string;
  quantity?: number;
  is_sideboard?: boolean;
};

type SpicerackExportItem = {
  tid?: string | number;
  player_name?: string;
  rank?: number;
  deck_name?: string;
  event_format?: string;
  decklist?: SpicerackDecklistCard[];
  tournament_name?: string;
  date?: string;
};

const SPICERACK_BASE_URL = "https://api.spicerack.gg/api";

function mapCard(card: SpicerackDecklistCard): TournamentDeckCard | null {
  const name = card.name?.trim();
  const quantity = Number(card.quantity ?? 0);
  if (!name || !quantity) return null;

  return {
    name,
    quantity,
    is_sideboard: Boolean(card.is_sideboard),
  };
}

function mapDeck(item: SpicerackExportItem, format: string): TournamentDeck | null {
  const id = item.tid != null ? String(item.tid) : "";
  if (!id) return null;

  const cards = (item.decklist ?? [])
    .map(mapCard)
    .filter((card): card is TournamentDeckCard => card !== null);

  return {
    id,
    player_name: item.player_name?.trim() || "Ukendt Spiller",
    rank: item.rank ?? 0,
    deck_name: item.deck_name?.trim() || `${format} Archetype`,
    format: item.event_format || format,
    cards,
    tournament_name: item.tournament_name?.trim() || "Ukendt turnering",
    date: item.date || "",
  };
}

/**
 * Henter de seneste turneringsdæklister fra Spicerack baseret på format.
 * Kræver en gratis API-nøgle fra spicerack.gg sendt med i headeren.
 */
export async function getLatestTournamentDecks(
  format: string = "MODERN",
  days: number = 14,
): Promise<TournamentDeck[]> {
  "use cache";
  cacheLife("hours");

  const apiKey = process.env.SPICERACK_API_KEY;

  if (!apiKey) {
    console.warn("Spicerack API Key mangler i .env filen.");
    return [];
  }

  try {
    const response = await fetch(
      `${SPICERACK_BASE_URL}/export-decklists/?event_format=${encodeURIComponent(format)}&num_days=${days}`,
      {
        headers: {
          "X-API-Key": apiKey,
          Accept: "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Spicerack API fejl: ${response.statusText}`);
    }

    const data = (await response.json()) as SpicerackExportItem[];

    if (!Array.isArray(data)) {
      console.error("Uventet Spicerack-svar: forventede et array.");
      return [];
    }

    return data
      .map((item) => mapDeck(item, format))
      .filter((deck): deck is TournamentDeck => deck !== null);
  } catch (error) {
    console.error(`Kunne ikke hente turneringer for formatet ${format}:`, error);
    return [];
  }
}

/**
 * Finder et enkelt turneringsdæk blandt de seneste eksportede lister.
 */
export async function getTournamentDeckById(
  id: string,
  format: string = "MODERN",
  days: number = 14,
): Promise<TournamentDeck | null> {
  const decks = await getLatestTournamentDecks(format, days);
  return decks.find((deck) => deck.id === id) ?? null;
}
