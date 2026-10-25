import { parseDecklistText } from "@/lib/decklist-text";
import type { TournamentDeck } from "@/lib/tournaments";

const BASE_URL = "https://www.mtgtop8.com";
const USER_AGENT = "untap.dk/0.1 (https://untap.dk; contact@untap.dk)";

const DECK_ROW_RE =
  /class=(?:chosen_tr|hover_tr)[\s\S]*?class=S14>([^<]+)<\/div>[\s\S]*?<a href=\?e=(\d+)&d=(\d+)[^>]*>([^<]+)<\/a>[\s\S]*?class=player[^>]*>([^<]+)<\/a>/g;

type EventDeckRef = {
  eventId: string;
  deckId: string;
  rank: string;
  deckName: string;
  playerName: string;
  tournamentName: string;
  date: string;
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

function parseEventIds(formatHtml: string): string[] {
  const ids = [...formatHtml.matchAll(/event\?e=(\d+)/g)].map((match) => match[1]);
  return [...new Set(ids)];
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

  return { tournamentName, date };
}

function dmyToIso(dmy: string): string {
  const [dd, mm, yy] = dmy.split("/");
  const year = Number(yy) < 70 ? `20${yy}` : `19${yy}`;
  return `${year}-${mm}-${dd}`;
}

function decodeHtml(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function parseEventDecks(
  eventHtml: string,
  eventId: string,
  tournamentName: string,
  date: string,
): EventDeckRef[] {
  const decks: EventDeckRef[] = [];
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
    });
  }

  if (decks.length === 0) {
    const fallback = eventHtml.match(
      /#(\d+(?:-\d+)?)\s+([^-]+)\s+-\s+<a class=player_big[^>]*>([^<]+)<\/a>/,
    );
    const deckId = eventHtml.match(/mtgo\?d=(\d+)/)?.[1];
    if (fallback && deckId) {
      decks.push({
        rank: fallback[1],
        eventId,
        deckId,
        deckName: decodeHtml(fallback[2].trim()),
        playerName: decodeHtml(fallback[3].trim()),
        tournamentName,
        date,
      });
    }
  }

  return decks;
}

async function fetchDecklistText(deckId: string): Promise<string> {
  return fetchText(`${BASE_URL}/mtgo?d=${encodeURIComponent(deckId)}`);
}

/**
 * Henter seneste Modern-dæk fra MTGTop8 (offentlig HTML + MTGO-export).
 * Ingen API-nøgle kræves.
 */
export async function fetchModernDecksFromMtgTop8(
  limit = 12,
): Promise<TournamentDeck[]> {
  const formatHtml = await fetchText(`${BASE_URL}/format?f=MO`);
  const eventIds = parseEventIds(formatHtml).slice(0, 4);
  const collected: TournamentDeck[] = [];

  for (const eventId of eventIds) {
    if (collected.length >= limit) break;

    const eventHtml = await fetchText(
      `${BASE_URL}/event?e=${encodeURIComponent(eventId)}&f=MO`,
    );
    const { tournamentName, date } = parseEventMeta(eventHtml);
    const refs = parseEventDecks(eventHtml, eventId, tournamentName, date);

    for (const ref of refs) {
      if (collected.length >= limit) break;

      try {
        const raw = await fetchDecklistText(ref.deckId);
        const cards = parseDecklistText(raw);
        if (cards.length === 0) continue;

        collected.push({
          id: `mtgtop8-${ref.eventId}-${ref.deckId}`,
          player_name: ref.playerName,
          rank: ref.rank,
          deck_name: ref.deckName,
          format: "MODERN",
          cards,
          tournament_name: ref.tournamentName,
          date: ref.date,
        });
      } catch (error) {
        console.error(`Kunne ikke hente MTGTop8-dæk ${ref.deckId}:`, error);
      }
    }
  }

  return collected;
}
