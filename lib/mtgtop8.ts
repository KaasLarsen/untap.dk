import { parseDecklistText } from "@/lib/decklist-text";
import type { FormatCode } from "@/lib/formats";
import type { TournamentDeck } from "@/lib/tournaments";

const BASE_URL = "https://www.mtgtop8.com";
const USER_AGENT = "untap.dk/0.1 (https://untap.dk; contact@untap.dk)";

const DECK_ROW_RE =
  /class=(?:chosen_tr|hover_tr)[\s\S]*?class=S14>([^<]+)<\/div>[\s\S]*?<a href=\?e=(\d+)&d=(\d+)[^>]*>([^<]+)<\/a>[\s\S]*?class=player[^>]*>([^<]+)<\/a>/g;

const ARCHETYPE_RE =
  /href=(archetype\?a=(\d+)&meta=(\d+)&f=([A-Za-z0-9]+))[^>]*>([^<]+)<\/a>[\s\S]{0,400}?class=S14>([\d.]+)\s*%/gi;

const EVENT_RE =
  /<a href=event\?e=(\d+)&f=([A-Za-z0-9]+)>([^<]+)<\/a>(?:\s*@\s*<a[^>]*>([^<]+)<\/a>)?/g;

const ARCHETYPE_DECK_RE =
  /event\?e=(\d+)&d=(\d+)[^>]*>([^<]+)<\/a>\s*<\/td>\s*<td><a class=player[^>]*>([^<]+)<\/a><\/td>\s*<td><a href=\/event\?e=\d+[^>]*>([^<]+)<\/a><\/td>\s*<td[^>]*>[\s\S]*?<\/td>\s*<td>([^<]*)<\/td>\s*<td>(\d{2}\/\d{2}\/\d{2})<\/td>/gi;

export type MetagameArchetype = {
  id: string;
  meta: string;
  name: string;
  share: number;
  format: FormatCode;
};

export type FormatEvent = {
  id: string;
  name: string;
  location: string;
  format: FormatCode;
};

export type DeckRef = {
  eventId: string;
  deckId: string;
  rank: string;
  deckName: string;
  playerName: string;
  tournamentName: string;
  date: string;
  format: FormatCode;
};

async function fetchText(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "text/html,text/plain,*/*",
    },
  });

  if (!response.ok) {
    throw new Error(`MTGTop8 HTTP ${response.status} for ${url}`);
  }

  return response.text();
}

function decodeHtml(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#039;/g, "'");
}

function dmyToIso(dmy: string): string {
  const [dd, mm, yy] = dmy.split("/");
  const year = Number(yy) < 70 ? `20${yy}` : `19${yy}`;
  return `${year}-${mm}-${dd}`;
}

function parseEventMeta(eventHtml: string): {
  tournamentName: string;
  date: string;
} {
  const tournamentName =
    eventHtml.match(/class=event_title>([^<#]+)</)?.[1]?.trim() ||
    "MTGTop8 Event";

  const dateMatch = eventHtml.match(
    /(\d+)\s+players\s+-\s+(\d{2}\/\d{2}\/\d{2})/i,
  );
  const date = dateMatch ? dmyToIso(dateMatch[2]) : "";

  return { tournamentName: decodeHtml(tournamentName), date };
}

function parseEventDeckRows(
  eventHtml: string,
  format: FormatCode,
  tournamentName: string,
  date: string,
): DeckRef[] {
  const decks: DeckRef[] = [];
  DECK_ROW_RE.lastIndex = 0;

  let match: RegExpExecArray | null;
  while ((match = DECK_ROW_RE.exec(eventHtml)) !== null) {
    decks.push({
      rank: match[1].trim(),
      eventId: match[2],
      deckId: match[3],
      deckName: decodeHtml(match[4].trim()),
      playerName: decodeHtml(match[5].trim()),
      tournamentName,
      date,
      format,
    });
  }

  return decks;
}

async function fetchDecklistText(deckId: string): Promise<string> {
  return fetchText(`${BASE_URL}/mtgo?d=${encodeURIComponent(deckId)}`);
}

export function deckHrefId(eventId: string, deckId: string): string {
  return `mtgtop8-${eventId}-${deckId}`;
}

export function parseDeckHrefId(
  id: string,
): { eventId: string; deckId: string } | null {
  const match = id.match(/^mtgtop8-(\d+)-(\d+)$/);
  if (!match) return null;
  return { eventId: match[1], deckId: match[2] };
}

export async function hydrateDeckRef(ref: DeckRef): Promise<TournamentDeck | null> {
  const raw = await fetchDecklistText(ref.deckId);
  const cards = parseDecklistText(raw);
  if (cards.length === 0) return null;

  return {
    id: deckHrefId(ref.eventId, ref.deckId),
    player_name: ref.playerName,
    rank: ref.rank,
    deck_name: ref.deckName,
    format: ref.format,
    cards,
    tournament_name: ref.tournamentName,
    date: ref.date,
  };
}

export async function fetchFormatMetagame(
  format: FormatCode,
): Promise<MetagameArchetype[]> {
  const html = await fetchText(`${BASE_URL}/format?f=${format}`);
  const archetypes: MetagameArchetype[] = [];
  ARCHETYPE_RE.lastIndex = 0;

  let match: RegExpExecArray | null;
  while ((match = ARCHETYPE_RE.exec(html)) !== null) {
    archetypes.push({
      id: match[2],
      meta: match[3],
      name: decodeHtml(match[5].trim()),
      share: Number.parseFloat(match[6]),
      format: match[4] as FormatCode,
    });
  }

  return archetypes;
}

export async function fetchFormatEvents(
  format: FormatCode,
): Promise<FormatEvent[]> {
  const html = await fetchText(`${BASE_URL}/format?f=${format}`);
  const events: FormatEvent[] = [];
  const seen = new Set<string>();
  EVENT_RE.lastIndex = 0;

  let match: RegExpExecArray | null;
  while ((match = EVENT_RE.exec(html)) !== null) {
    const id = match[1];
    if (seen.has(id)) continue;
    seen.add(id);

    events.push({
      id,
      name: decodeHtml(match[3].trim()),
      location: decodeHtml((match[4] || "").trim()),
      format: (match[2] as FormatCode) || format,
    });
  }

  return events;
}

export async function fetchArchetypeDeckRefs(
  format: FormatCode,
  archetypeId: string,
  meta: string,
  limit = 24,
): Promise<DeckRef[]> {
  const html = await fetchText(
    `${BASE_URL}/archetype?a=${encodeURIComponent(archetypeId)}&meta=${encodeURIComponent(meta)}&f=${format}`,
  );

  const decks: DeckRef[] = [];
  ARCHETYPE_DECK_RE.lastIndex = 0;

  let match: RegExpExecArray | null;
  while ((match = ARCHETYPE_DECK_RE.exec(html)) !== null) {
    decks.push({
      eventId: match[1],
      deckId: match[2],
      deckName: decodeHtml(match[3].trim()),
      playerName: decodeHtml(match[4].trim()),
      tournamentName: decodeHtml(match[5].trim()),
      rank: match[6].trim(),
      date: dmyToIso(match[7]),
      format,
    });
    if (decks.length >= limit) break;
  }

  return decks;
}

export async function fetchEventDeckRefs(
  format: FormatCode,
  eventId: string,
): Promise<{ tournamentName: string; date: string; decks: DeckRef[] }> {
  const html = await fetchText(
    `${BASE_URL}/event?e=${encodeURIComponent(eventId)}&f=${format}`,
  );
  const { tournamentName, date } = parseEventMeta(html);
  const decks = parseEventDeckRows(html, format, tournamentName, date);
  return { tournamentName, date, decks };
}

export async function fetchDeckByHrefId(
  id: string,
  formatHint: FormatCode = "MO",
): Promise<TournamentDeck | null> {
  const parsed = parseDeckHrefId(id);
  if (!parsed) return null;

  try {
    const { tournamentName, date, decks } = await fetchEventDeckRefs(
      formatHint,
      parsed.eventId,
    );
    const ref =
      decks.find((deck) => deck.deckId === parsed.deckId) ??
      ({
        eventId: parsed.eventId,
        deckId: parsed.deckId,
        rank: "",
        deckName: "Deck",
        playerName: "Ukendt Spiller",
        tournamentName,
        date,
        format: formatHint,
      } satisfies DeckRef);

    return hydrateDeckRef(ref);
  } catch (error) {
    console.error(`Kunne ikke hente deck ${id}:`, error);
    return null;
  }
}

/**
 * Henter seneste dæk for et format fra MTGTop8 (offentlig HTML + MTGO-export).
 */
export async function fetchLatestDecksFromMtgTop8(
  format: FormatCode = "MO",
  limit = 12,
): Promise<TournamentDeck[]> {
  const events = await fetchFormatEvents(format);
  const collected: TournamentDeck[] = [];

  for (const event of events.slice(0, 4)) {
    if (collected.length >= limit) break;

    const { tournamentName, date, decks } = await fetchEventDeckRefs(
      format,
      event.id,
    );

    for (const ref of decks) {
      if (collected.length >= limit) break;
      try {
        const deck = await hydrateDeckRef({
          ...ref,
          tournamentName,
          date,
          format,
        });
        if (deck) collected.push(deck);
      } catch (error) {
        console.error(`Kunne ikke hente MTGTop8-dæk ${ref.deckId}:`, error);
      }
    }
  }

  return collected;
}

/** @deprecated Use fetchLatestDecksFromMtgTop8 */
export async function fetchModernDecksFromMtgTop8(
  limit = 12,
): Promise<TournamentDeck[]> {
  return fetchLatestDecksFromMtgTop8("MO", limit);
}
