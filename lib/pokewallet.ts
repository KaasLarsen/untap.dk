import { cacheLife } from "next/cache";

const BASE_URL = "https://api.pokewallet.io";

export type PricePoint = {
  /** ISO date (YYYY-MM-DD). */
  date: string;
  /** CardMarket EUR price. */
  price: number;
};

export type CardPriceTrendResult = {
  configured: boolean;
  query: string;
  cardName: string | null;
  setName: string | null;
  points: PricePoint[];
};

type CardmarketPriceRow = {
  variant_type?: string;
  avg?: number | null;
  low?: number | null;
  trend?: number | null;
  avg1?: number | null;
  avg7?: number | null;
  avg30?: number | null;
  updated_at?: string | null;
};

type PokewalletCard = {
  id: string;
  card_info?: {
    name?: string;
    set_name?: string;
    set_code?: string;
  };
  cardmarket?: {
    product_name?: string;
    prices?: CardmarketPriceRow[];
    product_url?: string;
  } | null;
};

type PokewalletSearchResponse = {
  query?: string;
  results?: PokewalletCard[];
};

export function isPokewalletConfigured(): boolean {
  return Boolean(process.env.POKEWALLET_KEY?.trim());
}

function emptyResult(
  query: string,
  configured: boolean,
): CardPriceTrendResult {
  return {
    configured,
    query,
    cardName: null,
    setName: null,
    points: [],
  };
}

function toIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function daysBefore(base: Date, days: number): Date {
  const next = new Date(base);
  next.setUTCDate(next.getUTCDate() - days);
  return next;
}

function pickCardmarketRow(
  prices: CardmarketPriceRow[] | undefined,
): CardmarketPriceRow | null {
  if (!prices?.length) return null;

  const normal = prices.find((row) => row.variant_type === "normal");
  if (normal) return normal;

  return (
    prices.find(
      (row) =>
        row.trend != null ||
        row.avg != null ||
        row.avg1 != null ||
        row.avg7 != null ||
        row.avg30 != null,
    ) ?? prices[0]
  );
}

/**
 * Build a sparse EUR trend from CardMarket moving averages.
 * MTG has no daily price-history endpoint; avg30/avg7/avg1/trend are the available series.
 */
export function mapCardmarketToPricePoints(
  row: CardmarketPriceRow,
): PricePoint[] {
  const base = row.updated_at ? new Date(row.updated_at) : new Date();
  if (Number.isNaN(base.getTime())) return [];

  const current = row.trend ?? row.avg;
  const series: Array<{ daysAgo: number; value: number | null | undefined }> = [
    { daysAgo: 30, value: row.avg30 },
    { daysAgo: 7, value: row.avg7 },
    { daysAgo: 1, value: row.avg1 },
    { daysAgo: 0, value: current },
  ];

  const points: PricePoint[] = [];
  for (const entry of series) {
    if (entry.value == null || !Number.isFinite(entry.value)) continue;
    points.push({
      date: toIsoDate(daysBefore(base, entry.daysAgo)),
      price: entry.value,
    });
  }

  return points;
}

async function fetchCardPriceTrend(
  query: string,
): Promise<CardPriceTrendResult> {
  "use cache";
  cacheLife("hours");

  const apiKey = process.env.POKEWALLET_KEY?.trim();
  if (!apiKey) return emptyResult(query, false);

  try {
    const url = new URL(`${BASE_URL}/mtg/search`);
    url.searchParams.set("q", query);
    url.searchParams.set("limit", "1");

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "X-API-Key": apiKey,
      },
    });

    if (!response.ok) {
      console.error(
        `PokéWallet search failed for "${query}": ${response.status} ${response.statusText}`,
      );
      return emptyResult(query, true);
    }

    const data = (await response.json()) as PokewalletSearchResponse;
    const card = data.results?.[0];
    if (!card) return emptyResult(query, true);

    const row = pickCardmarketRow(card.cardmarket?.prices);
    const cardName =
      card.card_info?.name ?? card.cardmarket?.product_name ?? null;
    const setName = card.card_info?.set_name ?? null;

    return {
      configured: true,
      query,
      cardName,
      setName,
      points: row ? mapCardmarketToPricePoints(row) : [],
    };
  } catch (error) {
    console.error(`PokéWallet error for "${query}":`, error);
    return emptyResult(query, true);
  }
}

/**
 * Search PokéWallet MTG and map CardMarket averages into chart-ready EUR points.
 * Server-only — uses POKEWALLET_KEY.
 */
export async function getCardPriceTrend(
  query: string,
): Promise<CardPriceTrendResult> {
  const trimmed = query.trim();
  if (trimmed.length < 2) {
    return emptyResult(trimmed, isPokewalletConfigured());
  }

  if (!isPokewalletConfigured()) {
    return emptyResult(trimmed, false);
  }

  return fetchCardPriceTrend(trimmed);
}
