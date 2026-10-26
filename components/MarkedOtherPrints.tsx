import Link from "next/link";
import { formatEurPriceOrDash } from "@/lib/market-price";
import { getCardPrints } from "@/lib/scryfall";

type MarkedOtherPrintsProps = {
  cardName: string;
  currentId: string;
};

export async function MarkedOtherPrints({
  cardName,
  currentId,
}: MarkedOtherPrintsProps) {
  const prints = await getCardPrints(cardName, 48);
  const others = prints.filter((print) => print.id !== currentId);

  if (others.length === 0) return null;

  return (
    <section className="mt-14 border-t border-line pt-10">
      <h2 className="font-display text-2xl tracking-tight text-parchment">
        Andre serier
      </h2>
      <p className="mt-2 text-sm text-parchment-muted">
        Samme kort i andre udgaver — vælg serien for at se prisen.
      </p>
      <ul className="mt-6 divide-y divide-line border-y border-line">
        {others.map((print) => (
          <li key={print.id}>
            <Link
              href={`/marked/kort/${encodeURIComponent(print.id)}`}
              className="flex items-baseline justify-between gap-4 py-3 transition-colors hover:bg-ink-elevated/50"
            >
              <span className="min-w-0">
                <span className="block text-sm text-parchment">
                  {print.set_name}{" "}
                  <span className="uppercase tracking-wide text-parchment-muted">
                    ({print.set})
                  </span>
                </span>
                <span className="text-xs text-parchment-muted">
                  #{print.collector_number}
                </span>
              </span>
              <span className="shrink-0 tabular-nums text-sm text-parchment">
                {formatEurPriceOrDash(print)}
                <span className="ml-1.5 text-xs text-parchment-muted">EUR</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
