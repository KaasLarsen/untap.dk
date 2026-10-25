import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Deck",
  description: "Turneringsdecks, metagame og events på untap.dk.",
};

/** Default format hub — Modern. */
export default function DeckPage() {
  redirect("/deck/f/modern");
}
