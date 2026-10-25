import { estimateDeckPriceEur, formatEurEstimate } from "@/lib/deck-price";
import { getCardByName, type ScryfallCard } from "@/lib/scryfall";
import type { TournamentDeckCard } from "@/lib/tournaments";
import { DecklistTooltip } from "./DecklistTooltip";

export type DecklistEntry = {
  quantity: number;
  name: string;
  section: "main" | "sideboard";
};

type DecklistProps = {
  raw?: string;
  entries?: DecklistEntry[] | TournamentDeckCard[];
  title?: string;
};

const SECTION_HEADERS = new Set(["sideboard", "side", "sb"]);

function parseDecklist(raw: string): DecklistEntry[] {
  let section: DecklistEntry["section"] = "main";
  const entries: DecklistEntry[] = [];

  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const header = trimmed.replace(/:$/, "").toLowerCase();
    if (SECTION_HEADERS.has(header)) {
      section = "sideboard";
      continue;
    }

    if (/^(deck|main|mainboard|main deck)$/i.test(header)) {
      section = "main";
      continue;
    }

    const match = trimmed.match(/^(\d+)\s+(.+)$/);
    if (!match) continue;

    const quantity = Number.parseInt(match[1], 10);
    const name = match[2].trim();
    if (!quantity || !name) continue;

    entries.push({ quantity, name, section });
  }

  return entries;
}

function normalizeEntries(
  entries: DecklistEntry[] | TournamentDeckCard[],
): DecklistEntry[] {
  return entries.map((entry) => {
    if ("section" in entry) return entry;

    return {
      quantity: entry.quantity,
      name: entry.name,
      section: entry.is_sideboard ? "sideboard" : "main",
    };
  });
}

async function resolveCards(
  names: string[],
): Promise<Map<string, ScryfallCard | null>> {
  const unique = [...new Set(names)];
  const results = await Promise.all(
    unique.map(async (name) => {
      const card = await getCardByName(name);
      return [name, card] as const;
    }),
  );
  return new Map(results);
}

function DeckSection({
  label,
  entries,
  cards,
}: {
  label: string;
  entries: DecklistEntry[];
  cards: Map<string, ScryfallCard | null>;
}) {
  if (entries.length === 0) return null;

  const total = entries.reduce((sum, entry) => sum + entry.quantity, 0);

  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between border-b border-line pb-2">
        <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-parchment-muted">
          {label}
        </h3>
        <span className="font-mono text-xs tabular-nums text-parchment-muted">
          {total}
        </span>
      </div>
      <ul className="space-y-0.5">
        {entries.map((entry) => {
          const card = cards.get(entry.name);
          return (
            <DecklistTooltip
              key={`${entry.section}-${entry.name}`}
              name={entry.name}
              quantity={entry.quantity}
              imageUrl={card?.image_uris?.normal}
              typeLine={card?.type_line}
            />
          );
        })}
      </ul>
    </section>
  );
}

export async function Decklist({
  raw,
  entries: structuredEntries,
  title = "Decklist",
}: DecklistProps) {
  "use cache";

  const entries = structuredEntries
    ? normalizeEntries(structuredEntries)
    : parseDecklist(raw ?? "");
  const cards = await resolveCards(entries.map((entry) => entry.name));
  const main = entries.filter((entry) => entry.section === "main");
  const sideboard = entries.filter((entry) => entry.section === "sideboard");
  const price = estimateDeckPriceEur(entries, cards);

  return (
    <article className="w-full text-parchment">
      <header className="mb-8 flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-parchment">
            {title}
          </h2>
          <p className="mt-1 text-sm text-parchment-muted">
            Tryk på et kortnavn for at se billedet.
          </p>
        </div>

        {price.pricedCards > 0 ? (
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-parchment-muted">
              Ca. pris at samle
            </p>
            <p className="mt-1 font-display text-2xl font-semibold text-accent">
              {formatEurEstimate(price.total)}
            </p>
            <p className="mt-0.5 text-xs text-parchment-muted">
              Scryfall EUR
              {price.missingCards > 0
                ? ` · ${price.missingCards} kort uden pris`
                : ""}
            </p>
          </div>
        ) : null}
      </header>

      <div className="grid gap-10 sm:grid-cols-2">
        <DeckSection label="Maindeck" entries={main} cards={cards} />
        <DeckSection label="Sideboard" entries={sideboard} cards={cards} />
      </div>
    </article>
  );
}
