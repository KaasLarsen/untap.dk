import Image from "next/image";
import Link from "next/link";
import {
  formatEurPriceOrDash,
  rarityLabelDa,
} from "@/lib/market-price";
import type { ScryfallCard } from "@/lib/scryfall";

type MarkedCardGridProps = {
  cards: ScryfallCard[];
  emptyLabel?: string;
};

export function MarkedCardGrid({
  cards,
  emptyLabel = "Ingen kort fundet.",
}: MarkedCardGridProps) {
  if (cards.length === 0) {
    return (
      <p className="mt-10 text-base text-parchment-muted">{emptyLabel}</p>
    );
  }

  return (
    <ul className="mt-10 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card, index) => (
        <li
          key={card.id}
          className="animate-fade-rise"
          style={{ animationDelay: `${Math.min(index, 8) * 0.05}s` }}
        >
          <Link
            href={`/marked/kort/${card.id}`}
            className="group block outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            <div className="relative aspect-[5/7] overflow-hidden bg-ink-elevated">
              {card.image_uris?.normal ? (
                <Image
                  src={card.image_uris.normal}
                  alt={card.name}
                  fill
                  unoptimized
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition duration-500 group-hover:scale-[1.03]"
                />
              ) : (
                <div className="flex h-full items-center justify-center px-4 text-center text-sm text-parchment-muted">
                  Intet billede
                </div>
              )}
            </div>
            <div className="mt-3 space-y-1">
              <p className="font-display text-xl tracking-tight text-parchment group-hover:text-accent-bright">
                {card.name}
              </p>
              <p className="text-sm text-parchment-muted">
                {card.set_name}{" "}
                <span className="uppercase tracking-wide">({card.set})</span>
                {" · "}
                {rarityLabelDa(card.rarity)}
              </p>
              <p className="text-base text-parchment">
                {formatEurPriceOrDash(card)}
                <span className="ml-2 text-xs text-parchment-muted">EUR</span>
              </p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
