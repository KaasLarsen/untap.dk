/**
 * Scryfall only exposes current mid prices — no time series.
 * Keep this honest until we snapshot history ourselves.
 */
export function PriceHistoryNote() {
  return (
    <section
      aria-labelledby="price-history-heading"
      className="mt-12 border-t border-line pt-10"
    >
      <h2
        id="price-history-heading"
        className="font-display text-2xl tracking-tight text-parchment"
      >
        Prishistorik
      </h2>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-parchment-muted sm:text-base">
        Scryfall giver kun den aktuelle EUR-midpris. Grafer kræver daglige
        snapshots eller en historik-API — dem har vi endnu ikke. Ingen falske
        kurver her.
      </p>
    </section>
  );
}
