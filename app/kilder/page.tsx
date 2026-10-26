import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Kilder & data",
  description:
    "API- og datakilder bag decklists, kortbilleder og priser på Untap.dk.",
};

export default function KilderPage() {
  return (
    <LegalPage
      title="Kilder & data"
      description="Attribution for de datakilder, Untap.dk faktisk bruger."
    >
      <p>
        Untap.dk trækker på eksterne API’er og offentlige kilder. Nedenfor er de
        kilder, der er koblet ind i kodebasen i dag. Butiks-/affiliatepartnere
        er ikke en del af sitet endnu.
      </p>

      <h2>Scryfall</h2>
      <p>
        Kortnavne, metadata, sætkoder og kortbilleder hentes via{" "}
        <a href="https://scryfall.com/" rel="noopener noreferrer" target="_blank">
          Scryfall
        </a>
        . Scryfall stiller data og billeder til rådighed under deres egne vilkår;
        kortillustrationer og Magic-relateret IP tilhører Wizards of the Coast.
        Deck- og archetype-estimater bruger billigste papir-print med Scryfall
        EUR, hvor prisen er tilgængelig (vejledende).
      </p>

      <h2>MTGTop8</h2>
      <p>
        Turneringer, metagame-oversigter og decklists hentes fra{" "}
        <a href="https://www.mtgtop8.com/" rel="noopener noreferrer" target="_blank">
          MTGTop8
        </a>
        . Indholdet er afledt af offentlig turneringsdata på den side.
      </p>

      <h2>Archidekt</h2>
      <p>
        Deck-import understøtter offentlige decks fra{" "}
        <a href="https://archidekt.com/" rel="noopener noreferrer" target="_blank">
          Archidekt
        </a>
        , når du selv indtaster et deck-ID eller en URL.
      </p>

      <h2>PokéWallet / Cardmarket</h2>
      <p>
        Sparsomme EUR-pristrends (gennemsnit over 30 / 7 / 1 dag + trend) på
        Marked og kort-sider hentes via{" "}
        <a href="https://pokewallet.io/" rel="noopener noreferrer" target="_blank">
          PokéWallet
        </a>
        , som eksponerer Cardmarket-priser. Det er ikke daglige snapshots.
        Funktionen er valgfri og kræver en konfigureret API-nøgle. Priser er
        vejledende og kan afvige fra den faktiske markedspris.
      </p>

      <h2>Butikspartnere</h2>
      <p>
        Partnere kommer senere. Untap.dk viser ikke forhandlerpartnere eller
        affiliate-lister endnu.
      </p>

      <h2>Fejl og mangler</h2>
      <p>
        Data kan være forsinket, ufuldstændig eller forkert. Ser du noget galt,
        så skriv til{" "}
        <a href="mailto:info@untap.dk">info@untap.dk</a>. Se også{" "}
        <Link href="/vilkaar">vilkårene</Link>.
      </p>
    </LegalPage>
  );
}
