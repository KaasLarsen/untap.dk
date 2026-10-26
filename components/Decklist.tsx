import {
  estimateDeckPriceEur,
  formatEurEstimate,
  isReliableDeckPriceEstimate,
} from "@/lib/deck-price";
import { normalizeCardName } from "@/lib/decklist-text";
import { getCardsByNames, type ScryfallCard } from "@/lib/scryfall";
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

type CardTypeGroup =
  | "Creatures"
  | "Planeswalkers"
  | "Instant"
  | "Sorcery"
  | "Enchantments"
  | "Artifacts"
  | "Battles"
  | "Lands"
  | "Other";

const SECTION_HEADERS = new Set(["sideboard", "side", "sb"]);

const TYPE_GROUP_ORDER: CardTypeGroup[] = [
  "Creatures",
  "Planeswalkers",
  "Instant",
  "Sorcery",
  "Enchantments",
  "Artifacts",
  "Battles",
  "Lands",
  "Other",
];

function cardTypeGroup(typeLine: string | undefined): CardTypeGroup {
  if (!typeLine) return "Other";

  const types = typeLine.split("—")[0].toLowerCase();

  // Creature before Land so Land Creatures (e.g. Dryad Arbor) stay under Creatures.
  if (types.includes("creature")) return "Creatures";
  if (types.includes("planeswalker")) return "Planeswalkers";
  if (types.includes("instant")) return "Instant";
  if (types.includes("sorcery")) return "Sorcery";
  if (types.includes("enchantment")) return "Enchantments";
  // Land before Artifact so Artifact Lands group under Lands.
  if (types.includes("land")) return "Lands";
  if (types.includes("artifact")) return "Artifacts";
  if (types.includes("battle")) return "Battles";

  return "Other";
}

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
    const name = normalizeCardName(match[2]);
    if (!quantity || !name) continue;

    entries.push({ quantity, name, section });
  }

  return entries;
}

function normalizeEntries(
  entries: DecklistEntry[] | TournamentDeckCard[],
): DecklistEntry[] {
  return entries.map((entry) => {
    if ("section" in entry) {
      return { ...entry, name: normalizeCardName(entry.name) };
    }

    return {
      quantity: entry.quantity,
      name: normalizeCardName(entry.name),
      section: entry.is_sideboard ? "sideboard" : "main",
    };
  });
}

async function resolveCards(
  names: string[],
): Promise<Map<string, ScryfallCard | null>> {
  const record = await getCardsByNames([...new Set(names)]);
  return new Map(Object.entries(record));
}

function groupEntriesByType(
  entries: DecklistEntry[],
  cards: Map<string, ScryfallCard | null>,
): { group: CardTypeGroup; entries: DecklistEntry[]; total: number }[] {
  const buckets = new Map<CardTypeGroup, DecklistEntry[]>();

  for (const entry of entries) {
    const group = cardTypeGroup(cards.get(entry.name)?.type_line);
    const list = buckets.get(group);
    if (list) {
      list.push(entry);
    } else {
      buckets.set(group, [entry]);
    }
  }

  return TYPE_GROUP_ORDER.flatMap((group) => {
    const groupEntries = buckets.get(group);
    if (!groupEntries || groupEntries.length === 0) return [];

    const sorted = [...groupEntries].sort((a, b) =>
      a.name.localeCompare(b.name, "en", { sensitivity: "base" }),
    );

    return [
      {
        group,
        entries: sorted,
        total: sorted.reduce((sum, entry) => sum + entry.quantity, 0),
      },
    ];
  });
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
  const groups = groupEntriesByType(entries, cards);

  return (
    <section className="space-y-5">
      <div className="flex items-baseline justify-between border-b border-line pb-2">
        <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-parchment-muted">
          {label}
        </h3>
        <span className="font-mono text-xs tabular-nums text-parchment-muted">
          {total}
        </span>
      </div>

      <div className="space-y-5">
        {groups.map(({ group, entries: groupEntries, total: groupTotal }) => (
          <div key={group} className="space-y-2">
            <div className="flex items-baseline justify-between">
              <h4 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
                {group}
              </h4>
              <span className="font-mono text-[11px] tabular-nums text-parchment-muted/70">
                {groupTotal}
              </span>
            </div>
            <ul className="space-y-0.5">
              {groupEntries.map((entry) => {
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
          </div>
        ))}
      </div>
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
            Hold over eller tryk på et kortnavn for at se billedet.
          </p>
        </div>

        {isReliableDeckPriceEstimate(price) ? (
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-parchment-muted">
              Ca. pris at samle
            </p>
            <p className="mt-1 font-display text-2xl font-semibold text-accent">
              {formatEurEstimate(price.total)}
            </p>
            <p className="mt-0.5 text-xs text-parchment-muted">
              EUR mid
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
