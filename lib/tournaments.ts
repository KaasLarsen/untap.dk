import { cacheLife } from "next/cache";
import { parseDecklistText } from "@/lib/decklist-text";
import { fetchModernDecksFromMtgTop8 } from "@/lib/mtgtop8";

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

export { parseDecklistText, normalizeCardName } from "@/lib/decklist-text";

/** Curated fallback if MTGTop8 is unreachable. */
const SAMPLE_DECKS: TournamentDeck[] = [
  {
    id: "sample-boros-energy",
    player_name: "Demo Spiller",
    rank: "1",
    deck_name: "Boros Energy",
    format: "MODERN",
    tournament_name: "untap.dk sample · Modern",
    date: "2026-10-20",
    cards: parseDecklistText(`4 Guide of Souls
4 Phlage, Titan of Fire's Fury
4 Ajani, Nacatl Pariah
4 Amped Raptor
4 Ocelot Pride
4 Goblin Bombardment
4 Static Prison
4 Galvanic Discharge
4 Arena of Glory
4 Sacred Foundry
4 Plains
4 Mountain
4 Elegant Parlor
4 Inspiring Vantage
4 Starting Town

Sideboard
2 Wear // Tear
2 Rest in Peace
2 Magus of the Moon
2 Obsidian Charmaw
2 High Noon
2 Surgical Extraction
1 Containment Priest
1 Soulless Jailer
1 Deafening Silence`),
  },
  {
    id: "sample-domain-zoo",
    player_name: "Demo Spiller",
    rank: "2",
    deck_name: "Domain Zoo",
    format: "MODERN",
    tournament_name: "untap.dk sample · Modern",
    date: "2026-10-18",
    cards: parseDecklistText(`4 Ragavan, Nimble Pilferer
4 Scion of Draco
4 Territorial Kavu
4 Tribal Flames
4 Lightning Bolt
4 Stubborn Denial
4 Leyline Binding
4 Expressive Iteration
4 Wooded Foothills
4 Arid Mesa
4 Verdant Catacombs
3 Flooded Strand
2 Temple Garden
2 Sacred Foundry
2 Steam Vents
2 Stomping Ground
1 Breeding Pool
1 Overgrown Tomb
1 Watery Grave
1 Godless Shrine
1 Island
1 Plains

Sideboard
2 Pick Your Poison
2 Rest in Peace
2 Wear // Tear
2 Mystical Dispute
2 Consign to Memory
2 Surgical Extraction
1 Jegantha, the Wellspring
1 Void Mirror
1 Stern Scolding`),
  },
  {
    id: "sample-affinity",
    player_name: "Demo Spiller",
    rank: "3",
    deck_name: "Affinity",
    format: "MODERN",
    tournament_name: "untap.dk sample · Modern",
    date: "2026-10-12",
    cards: parseDecklistText(`4 Memnite
4 Ornithopter
4 Gingerbrute
4 Sojourner's Companion
4 Frogmite
4 Thoughtcast
4 Cranial Plating
4 Springleaf Drum
4 Metallic Rebuke
4 Mistvault Bridge
4 Tishana's Tidebinder
3 Island
2 Otawara, Soaring City
2 Spire of Industry
2 Darksteel Citadel
2 Treasure Vault
1 Urza's Saga
1 Breeding Pool
1 Watery Grave
1 Flooded Strand
1 Polluted Delta

Sideboard
3 Consign to Memory
2 Dismember
2 Soul-Guide Lantern
2 Grafdigger's Cage
2 Pithing Needle
2 Metallic Rebuke
1 Shadowspear
1 Hurkyl's Recall`),
  },
];

/**
 * Seneste turneringsdæk — primært fra MTGTop8 (ingen API-nøgle).
 */
export async function getLatestTournamentDecks(
  format: string = "MODERN",
  _days: number = 14,
): Promise<TournamentDeck[]> {
  "use cache";
  cacheLife("hours");

  if (format !== "MODERN") {
    return SAMPLE_DECKS.filter((deck) => deck.format === format);
  }

  try {
    const decks = await fetchModernDecksFromMtgTop8(12);
    if (decks.length > 0) return decks;
  } catch (error) {
    console.error("MTGTop8-fetch fejlede:", error);
  }

  return SAMPLE_DECKS.filter((deck) => deck.format === format);
}

export async function getTournamentDeckById(
  id: string,
  format: string = "MODERN",
  days: number = 14,
): Promise<TournamentDeck | null> {
  const decks = await getLatestTournamentDecks(format, days);
  return decks.find((deck) => deck.id === id) ?? null;
}
