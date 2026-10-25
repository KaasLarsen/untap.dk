import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/PlaceholderPage";

export const metadata: Metadata = {
  title: "Marked",
  description: "Markedspriser kommer snart på untap.dk.",
};

export default function MarkedPage() {
  return (
    <PlaceholderPage
      title="Marked"
      description="Prisfeeds og købsvejledning kommer her. Affiliate-links til Kelz0r tilsluttes, når tracking er på plads — stadig ingen falske tal."
    />
  );
}
