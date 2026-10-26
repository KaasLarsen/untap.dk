import { PriceTrendChart } from "@/components/PriceTrendChart";
import { getCardPriceTrend } from "@/lib/pokewallet";

type CardPriceHistoryProps = {
  cardName: string;
  setName: string;
  setCode: string;
};

function buildTrendQuery(cardName: string, setName: string, setCode: string): string {
  const name = cardName.trim();
  const set = setName.trim() || setCode.trim();
  if (!set) return name;
  return `${name} ${set}`;
}

function emptyMessage(result: {
  configured: boolean;
  cardName: string | null;
}): string {
  if (!result.configured) {
    return "Pristrends er midlertidigt utilgængelige.";
  }
  if (result.cardName) {
    return `Fandt “${result.cardName}”, men ingen Cardmarket-trend at plotte.`;
  }
  return "Ingen Cardmarket-trend for dette print endnu.";
}

/**
 * Sparse Cardmarket EUR trend via PokéWallet (avg30 / avg7 / avg1 / trend).
 * Not daily history — labeled as such by PriceTrendChart.
 */
export async function CardPriceHistory({
  cardName,
  setName,
  setCode,
}: CardPriceHistoryProps) {
  const query = buildTrendQuery(cardName, setName, setCode);
  const result = await getCardPriceTrend(query);

  const chartTitle = result.cardName
    ? `${result.cardName}${result.setName ? ` · ${result.setName}` : ""}`
    : "Prishistorik (EUR)";

  return (
    <section
      aria-labelledby="price-history-heading"
      className="mt-12 border-t border-line pt-10"
    >
      <h2 id="price-history-heading" className="sr-only">
        Prishistorik
      </h2>
      <PriceTrendChart
        data={result.points}
        title={chartTitle}
        emptyMessage={emptyMessage(result)}
      />
      {result.cardName && result.points.length > 0 ? (
        <p className="mt-3 text-xs text-parchment-muted">
          Match via PokéWallet / Cardmarket
          {result.setName ? `: ${result.cardName} · ${result.setName}` : `: ${result.cardName}`}
          . Sparsom trend (ikke daglige snapshots).
        </p>
      ) : null}
    </section>
  );
}
