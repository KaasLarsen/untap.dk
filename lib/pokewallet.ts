import { cacheLife } from "next/cache";

const BASE_URL = "https://api.pokewallet.io";

export type PricePoint = {
  /** ISO date (YYYY-MM-DD). */
  date: string;
  /** CardMarket EUR price. */
  price: number;
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

type TcgplayerPriceRow = {
  low_price?: number | null;
  mid_price?: number | null;
  high_price?: number | null;
  market_price?: number | null;
  direct_low_price?: number | null;
  updated_at?: string | null;
  sub_type_name?: string | null;
};

type PokewalletCard = {
  id: string;
  card_info?: {
    name?: string;
    set_name?: string;
    set_code?: string;
  };
  tcgplayer?: {
    prices?: TcgplayerPriceRow[];
    url?: string;
  } | null;
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

function requireApiKey(): string {
  const key = process.env.POKEWALLET_KEY;
  if (!key) {
    throw new Error(
      "Missing POKEWALLET_KEY. Add it to .env.local (see .env.example).",
    );
  }
  return key;
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

/**
 * Search PokéWallet MTG and map CardMarket averages into chart-ready EUR points.
 * Server-only — uses POKEWALLET_KEY.
 */
export async function getCardPriceTrend(query: string): Promise<PricePoint[]> {
  "use cache";
  cacheLife("hours");

  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const apiKey = requireApiKey();

  try {
    const url = new URL(`${BASE_URL}/mtg/search`);
    url.searchParams.set("q", trimmed);
    url.searchParams.set("limit", "1");

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "X-API-Key": apiKey,
      },
    });

    if (!response.ok) {
      console.error(
        `PokéWallet search failed for "${trimmed}": ${response.status} ${response.statusText}`,
      );
      return [];
    }

    const data = (await response.json()) as PokewalletSearchResponse;
    const card = data.results?.[0];
    if (!card) return [];

    const row = pickCardmarketRow(card.cardmarket?.prices);
    if (!row) return [];

    return mapCardmarketToPricePoints(row);
  } catch (error) {
    console.error(`PokéWallet error for "${trimmed}":`, error);
    return [];
  }
}
