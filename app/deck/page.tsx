import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/PlaceholderPage";

export const metadata: Metadata = {
  title: "Deck",
  description: "Decklists kommer snart på untap.dk.",
};

export default function DeckPage() {
  return (
    <PlaceholderPage
      title="Decklists"
      description="Her lander overblik over decks, når Scryfall-integration og lister er klar. Ingen dummy-data — kun ægte indhold, når det er klar."
    />
  );
}
