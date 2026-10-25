"use server";

import {
  fetchArchidektDeck,
  parseArchidektDeckId,
  type ArchidektDeck,
} from "@/lib/archidekt";

export type ImportArchidektResult =
  | { ok: true; deck: ArchidektDeck }
  | { ok: false; error: string };

export async function importArchidektDeck(
  input: string,
): Promise<ImportArchidektResult> {
  const deckId = parseArchidektDeckId(input);

  if (!deckId) {
    return {
      ok: false,
      error: "Indsæt et Archidekt deck-ID eller en gyldig deck-URL.",
    };
  }

  try {
    const deck = await fetchArchidektDeck(deckId);
    return { ok: true, deck };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Kunne ikke hente deck.";
    console.error(`Archidekt import fejlede for "${deckId}":`, error);
    return { ok: false, error: message };
  }
}
