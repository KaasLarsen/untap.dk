export type ParsedDeckCard = {
  name: string;
  quantity: number;
  is_sideboard: boolean;
};

const SECTION_HEADERS = new Set(["sideboard", "side", "sb"]);

export function normalizeCardName(name: string): string {
  // Preserve existing "//" split markers first. A bare "/" pass afterwards
  // would otherwise rewrite "Wear // Tear" into "Wear //  // Tear".
  return name
    .replace(/\s*\/\/\s*/g, " // ")
    .replace(/(^|[^/])\s*\/\s*([^/]|$)/g, "$1 // $2")
    .replace(/\s+/g, " ")
    .trim();
}

export function parseDecklistText(raw: string): ParsedDeckCard[] {
  let sideboard = false;
  const cards: ParsedDeckCard[] = [];

  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const header = trimmed.replace(/:$/, "").toLowerCase();
    if (SECTION_HEADERS.has(header)) {
      sideboard = true;
      continue;
    }

    if (/^(deck|main|mainboard|main deck)$/i.test(header)) {
      sideboard = false;
      continue;
    }

    const match = trimmed.match(/^(\d+)\s+(.+)$/);
    if (!match) continue;

    const quantity = Number.parseInt(match[1], 10);
    const name = normalizeCardName(match[2]);
    if (!quantity || !name) continue;

    cards.push({
      quantity,
      name,
      is_sideboard: sideboard,
    });
  }

  return cards;
}
