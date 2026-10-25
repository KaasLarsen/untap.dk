import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/PlaceholderPage";

export const metadata: Metadata = {
  title: "Dæk",
  description: "Dæklister kommer snart på untap.dk.",
};

export default function DaekPage() {
  return (
    <PlaceholderPage
      title="Dæklister"
      description="Her lander overblik over dæk, når Scryfall-integration og lister er klar. Ingen dummy-data — kun ægte indhold, når det er klar."
    />
  );
}
