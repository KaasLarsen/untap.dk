import { getCardByName, type ScryfallCard } from "@/lib/scryfall";
import { DecklistTooltip } from "./DecklistTooltip";

export type DecklistEntry = {
  quantity: number;
  name: string;
  section: "main" | "sideboard";
};

type DecklistProps = {
  raw: string;
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

function Section({
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
      <div className="flex items-baseline justify-between border-b border-zinc-800 pb-2">
        <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
          {label}
        </h3>
        <span className="font-mono text-xs tabular-nums text-zinc-600">
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

export async function Decklist({ raw, title = "Decklist" }: DecklistProps) {
  "use cache";

  const entries = parseDecklist(raw);
  const cards = await resolveCards(entries.map((entry) => entry.name));
  const main = entries.filter((entry) => entry.section === "main");
  const sideboard = entries.filter((entry) => entry.section === "sideboard");

  return (
    <article className="w-full max-w-md rounded-2xl border border-zinc-800/90 bg-gradient-to-b from-zinc-900 to-zinc-950 p-6 text-zinc-100 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.9)]">
      <header className="mb-6 space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-500/80">
          untap.dk
        </p>
        <h2 className="font-serif text-2xl tracking-tight text-zinc-50">
          {title}
        </h2>
      </header>

      <div className="space-y-8">
        <Section label="Maindeck" entries={main} cards={cards} />
        <Section label="Sideboard" entries={sideboard} cards={cards} />
      </div>
    </article>
  );
}
