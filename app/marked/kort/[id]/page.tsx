import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CardPriceHistory } from "@/components/CardPriceHistory";
import {
  formatEurPriceOrDash,
  rarityLabelDa,
} from "@/lib/market-price";
import { getCardById } from "@/lib/scryfall";

type CardPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: CardPageProps): Promise<Metadata> {
  const { id } = await params;
  const card = await getCardById(decodeURIComponent(id));

  if (!card) {
    return { title: "Kort ikke fundet" };
  }

  return {
    title: card.name,
    description: `${card.name} — ${card.set_name}. Aktuel EUR-pris på untap.dk Marked.`,
  };
}

export default function MarkedCardPage({ params }: CardPageProps) {
  return (
    <Suspense fallback={<CardFallback />}>
      <MarkedCardDetail params={params} />
    </Suspense>
  );
}

async function MarkedCardDetail({ params }: CardPageProps) {
  const { id } = await params;
  const card = await getCardById(decodeURIComponent(id));

  if (!card) {
    notFound();
  }

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-5 py-16 sm:px-8 sm:py-24">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
        Marked · Kort
      </p>
      <h1 className="mt-4 font-display text-4xl tracking-tight text-parchment sm:text-5xl">
        {card.name}
      </h1>
      <p className="mt-3 max-w-2xl text-base text-parchment-muted sm:text-lg">
        {card.set_name}{" "}
        <span className="uppercase tracking-wide">({card.set})</span>
        {" · #"}
        {card.collector_number}
        {" · "}
        {rarityLabelDa(card.rarity)}
      </p>

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,20rem)_1fr] lg:items-start">
        <div className="relative mx-auto aspect-[5/7] w-full max-w-sm overflow-hidden bg-ink-elevated lg:mx-0">
          {card.image_uris?.normal ? (
            <Image
              src={card.image_uris.normal}
              alt={card.name}
              fill
              unoptimized
              priority
              sizes="(max-width: 1024px) 100vw, 20rem"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-parchment-muted">
              Intet billede
            </div>
          )}
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-parchment-muted">
            Aktuel pris
          </p>
          <p className="mt-2 font-display text-4xl tracking-tight text-parchment sm:text-5xl">
            {formatEurPriceOrDash(card)}
          </p>
          <p className="mt-2 text-sm text-parchment-muted">
            EUR mid
          </p>

          {card.type_line ? (
            <p className="mt-8 text-base text-parchment">{card.type_line}</p>
          ) : null}
          {card.oracle_text ? (
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-parchment-muted">
              {card.oracle_text}
            </p>
          ) : null}

          <p className="mt-8">
            <Link
              href={`/marked/serie/${encodeURIComponent(card.set)}`}
              className="text-sm text-accent-bright underline-offset-4 hover:underline"
            >
              Se serien {card.set_name}
            </Link>
          </p>

          <CardPriceHistory
            cardName={card.name}
            setName={card.set_name}
            setCode={card.set}
          />
        </div>
      </div>

      <p className="mt-14">
        <Link
          href="/marked"
          className="text-sm text-accent-bright underline-offset-4 hover:underline"
        >
          Tilbage til Marked
        </Link>
      </p>
    </main>
  );
}

function CardFallback() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-5 py-16 sm:px-8 sm:py-24">
      <div className="space-y-4">
        <div className="h-3 w-24 animate-pulse bg-ink-elevated" />
        <div className="h-10 w-72 animate-pulse bg-ink-elevated" />
        <div className="h-5 w-96 max-w-full animate-pulse bg-ink-elevated" />
      </div>
      <div className="h-[28rem] w-full max-w-sm animate-pulse bg-ink-elevated" />
    </main>
  );
}
