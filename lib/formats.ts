export type FormatCode =
  | "MO"
  | "ST"
  | "PI"
  | "LE"
  | "VI"
  | "PAU"
  | "EDH"
  | "cEDH"
  | "PREM";

export type FormatDefinition = {
  code: FormatCode;
  slug: string;
  label: string;
};

export const FORMATS: FormatDefinition[] = [
  { code: "MO", slug: "modern", label: "Modern" },
  { code: "ST", slug: "standard", label: "Standard" },
  { code: "PI", slug: "pioneer", label: "Pioneer" },
  { code: "LE", slug: "legacy", label: "Legacy" },
  { code: "VI", slug: "vintage", label: "Vintage" },
  { code: "PAU", slug: "pauper", label: "Pauper" },
  { code: "EDH", slug: "duel-commander", label: "Duel Commander" },
  { code: "cEDH", slug: "cedh", label: "cEDH" },
  { code: "PREM", slug: "premodern", label: "Premodern" },
];

export function getFormatBySlug(slug: string): FormatDefinition | undefined {
  return FORMATS.find(
    (format) =>
      format.slug === slug.toLowerCase() ||
      format.code.toLowerCase() === slug.toLowerCase(),
  );
}

export function getFormatByCode(code: string): FormatDefinition | undefined {
  return FORMATS.find(
    (format) => format.code.toLowerCase() === code.toLowerCase(),
  );
}
