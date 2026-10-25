import type { Metadata } from "next";
import { ArchidektImporter } from "@/components/ArchidektImporter";

export const metadata: Metadata = {
  title: "Importer Archidekt",
  description: "Hent en offentlig Archidekt-decklist til untap.dk.",
};

export default function ArchidektImportPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-10 px-5 py-16 sm:px-8 sm:py-24">
      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
          untap.dk
        </p>
        <h1 className="font-display text-4xl tracking-tight text-parchment sm:text-5xl">
          Archidekt-import
        </h1>
        <p className="max-w-xl text-base leading-relaxed text-parchment-muted">
          Indsæt et deck-ID eller en Archidekt-URL for at hente og vise
          decklisten.
        </p>
      </header>

      <ArchidektImporter />
    </main>
  );
}
