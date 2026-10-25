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

type SpicerackStanding = {
  name?: string;
  decklist?: string;
  decklist_text?: string;
  winsSwiss?: number;
  lossesSwiss?: number;
  draws?: number;
  winsBracket?: number;
  lossesBracket?: number;
};

type SpicerackTournament = {
  TID?: string;
  tournamentName?: string;
  format?: string;
  startDate?: number;
  standings?: SpicerackStanding[];
};

const SPICERACK_BASE_URL = "https://api.spicerack.gg/api";

const SECTION_HEADERS = new Set(["sideboard", "side", "sb"]);

/** Curated Modern samples so the site looks alive before Spicerack is wired. */
const SAMPLE_DECKS: TournamentDeck[] = [
  {
    id: "sample-boros-energy",
    player_name: "Demo Spiller",
    rank: 1,
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
    rank: 2,
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
    id: "sample-esper-blink",
    player_name: "Demo Spiller",
    rank: 3,
    deck_name: "Esper Blink",
    format: "MODERN",
    tournament_name: "untap.dk sample · Modern",
    date: "2026-10-15",
    cards: parseDecklistText(`4 Solitude
4 Subtlety
4 Psychic Frog
4 Phelia, Exuberant Shepherd
4 Ephemerate
4 Counterspell
4 Force of Negation
4 Tishana's Tidebinder
4 Flooded Strand
4 Polluted Delta
4 Marsh Flats
3 Island
2 Plains
2 Hallowed Fountain
2 Godless Shrine
2 Watery Grave
2 Otawara, Soaring City
1 Eiganjo, Seat of the Empire

Sideboard
2 Consign to Memory
2 Dress Down
2 Celestial Purge
2 Surgical Extraction
2 Wrath of the Skies
2 Mystical Dispute
1 Teferi, Time Raveler
1 Ashiok, Dream Render
1 Kaervek, the Punisher`),
  },
  {
    id: "sample-affinity",
    player_name: "Demo Spiller",
    rank: 4,
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
  {
    id: "sample-amagoyf",
    player_name: "Demo Spiller",
    rank: 5,
    deck_name: "Amulet Titan",
    format: "MODERN",
    tournament_name: "untap.dk sample · Modern",
    date: "2026-10-10",
    cards: parseDecklistText(`4 Primeval Titan
4 Arboreal Grazer
4 Dryad of the Ilysian Grove
4 Amulet of Vigor
4 Explore
4 Summoner's Pact
4 Spelunking
4 Boseiju, Who Endures
4 Forest
3 Simic Growth Chamber
2 Urza's Saga
2 Otawara, Soaring City
2 Crumbling Vestige
2 Tolaria West
2 Valakut, the Molten Pinnacle
2 Slayers' Stronghold
1 Island
1 Breeding Pool
1 Commercial District
1 Mirrorpool
1 The Mycosynth Gardens
1 Golgari Rot Farm

Sideboard
2 Endurance
2 Dismember
2 Force of Vigor
2 Pick Your Poison
2 Consign to Memory
1 Collector Ouphe
1 Haywire Mite
1 Boseiju, Who Endures
1 Thragtusk
1 Tireless Tracker`),
  },
  {
    id: "sample-rw-burn",
    player_name: "Demo Spiller",
    rank: 6,
    deck_name: "Boros Burn",
    format: "MODERN",
    tournament_name: "untap.dk sample · Modern",
    date: "2026-10-08",
    cards: parseDecklistText(`4 Goblin Guide
4 Monastery Swiftspear
4 Eidolon of the Great Revel
4 Lightning Bolt
4 Searing Blaze
4 Skewer the Critics
4 Lava Spike
4 Rift Bolt
4 Lightning Helix
4 Sacred Foundry
4 Inspiring Vantage
4 Sunbaked Canyon
4 Mountain
4 Arid Mesa
4 Scalding Tarn

Sideboard
3 Smash to Smithereens
3 Path to Exile
2 Kor Firewalker
2 Rest in Peace
2 Searing Blood
2 Wear // Tear
1 Deflecting Palm`),
  },
];

export function parseDecklistText(raw: string): TournamentDeckCard[] {
  let sideboard = false;
  const cards: TournamentDeckCard[] = [];

  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const header = trimmed.replace(/:$/, "").toLowerCase();
    if (SECTION_HEADERS.has(header)) {
      sideboard = true;
      continue;
    }

    if (/^(deck|main|mainboard|main deck)$/i.test(header)) {
      sideboard = false;
      continue;
    }

    const match = trimmed.match(/^(\d+)\s+(.+)$/);
    if (!match) continue;

    const quantity = Number.parseInt(match[1], 10);
    const name = match[2].trim();
    if (!quantity || !name) continue;

    cards.push({
      quantity,
      name,
      is_sideboard: sideboard,
    });
  }

  return cards;
}

function unixToIsoDate(startDate?: number): string {
  if (!startDate || !Number.isFinite(startDate)) return "";
  const ms = startDate > 1e12 ? startDate : startDate * 1000;
  return new Date(ms).toISOString().slice(0, 10);
}

function guessDeckName(cards: TournamentDeckCard[], format: string): string {
  const main = cards.filter((card) => !card.is_sideboard);
  if (main.length === 0) return `${format} Deck`;

  const top = [...main]
    .filter((card) => !/^(Island|Plains|Swamp|Mountain|Forest|Snow-Covered)/i.test(card.name))
    .sort((a, b) => b.quantity - a.quantity)[0];

  return top?.name ? `${top.name} Deck` : `${format} Deck`;
}

function mapTournament(
  tournament: SpicerackTournament,
  formatFallback: string,
): TournamentDeck[] {
  const tid = tournament.TID?.trim();
  if (!tid || !tournament.standings?.length) return [];

  const format = tournament.format || formatFallback;
  const tournamentName =
    tournament.tournamentName?.trim() || "Ukendt turnering";
  const date = unixToIsoDate(tournament.startDate);

  return tournament.standings.flatMap((standing, index) => {
    const text = standing.decklist_text?.trim();
    if (!text) return [];

    const cards = parseDecklistText(text);
    if (cards.length === 0) return [];

    const player = standing.name?.trim() || "Ukendt Spiller";

    return [
      {
        id: `${tid}-${index + 1}`,
        player_name: player,
        rank: index + 1,
        deck_name: guessDeckName(cards, format),
        format,
        cards,
        tournament_name: tournamentName,
        date,
      },
    ];
  });
}

/**
 * Henter de seneste turneringsdæklister fra Spicerack baseret på format.
 * Kræver SPICERACK_API_KEY. Uden nøgle returneres curated sample-dæk.
 */
export async function getLatestTournamentDecks(
  format: string = "MODERN",
  days: number = 14,
): Promise<TournamentDeck[]> {
  "use cache";
  cacheLife("hours");

  const apiKey = process.env.SPICERACK_API_KEY;

  if (!apiKey) {
    console.warn(
      "Spicerack API Key mangler — viser sample-dæk indtil nøglen er sat.",
    );
    return SAMPLE_DECKS.filter((deck) => deck.format === format);
  }

  try {
    const url = new URL(`${SPICERACK_BASE_URL}/export-decklists/`);
    url.searchParams.set("event_format", format);
    url.searchParams.set("num_days", String(days));
    url.searchParams.set("decklist_as_text", "true");

    const response = await fetch(url, {
      headers: {
        "X-API-Key": apiKey,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Spicerack API fejl: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as SpicerackTournament[];

    if (!Array.isArray(data)) {
      console.error("Uventet Spicerack-svar: forventede et array.");
      return SAMPLE_DECKS.filter((deck) => deck.format === format);
    }

    const decks = data.flatMap((tournament) =>
      mapTournament(tournament, format),
    );

    return decks.length > 0
      ? decks
      : SAMPLE_DECKS.filter((deck) => deck.format === format);
  } catch (error) {
    console.error(`Kunne ikke hente turneringer for formatet ${format}:`, error);
    return SAMPLE_DECKS.filter((deck) => deck.format === format);
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
