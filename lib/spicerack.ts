/**
 * Legacy Spicerack helpers — kept for optional future use.
 * Live decklists now come from MTGTop8 via `@/lib/tournaments`.
 */
export {
  getLatestTournamentDecks,
  getTournamentDeckById,
  parseDecklistText,
  type TournamentDeck,
  type TournamentDeckCard,
} from "@/lib/tournaments";
