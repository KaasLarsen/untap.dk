import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Vilkår",
  description: "Brugsvilkår for Untap.dk som indholdssite.",
};

export default function VilkaarPage() {
  return (
    <LegalPage
      title="Vilkår"
      description="Korte vilkår for brug af Untap.dk."
    >
      <h2>Tjenesten</h2>
      <p>
        Untap.dk stiller information om Magic: The Gathering til rådighed —
        artikler, decklists, turneringsoversigter og markedsdata. Sitet er et
        indholdssite, ikke en webshop. Vi sælger ikke varer via Untap.dk.
      </p>

      <h2>Ingen garanti</h2>
      <p>
        Indhold og data leveres “som de er”. Vi bestræber os på korrekthed, men
        garanterer ikke, at decklists, priser, metagame-tal eller andre
        oplysninger er fuldstændige, aktuelle eller fejlfri. Brug oplysningerne
        på eget ansvar.
      </p>

      <h2>Tredjepart</h2>
      <p>
        Links og data fra tredjepart (fx Scryfall, MTGTop8, Archidekt,
        PokéWallet/Cardmarket) er underlagt de respektive udbyderes vilkår. Se{" "}
        <Link href="/kilder">Kilder &amp; data</Link>.
      </p>

      <h2>Intellektuel ejendomsret</h2>
      <p>
        Magic: The Gathering, Magic-kortnavne, illustrationer og relaterede
        varemærker er © Wizards of the Coast LLC. Untap.dk er ikke affiliated
        med, endorsed af eller sponsored af Wizards of the Coast. Øvrigt
        indhold på Untap.dk (fx vores egne tekster og layout) tilhører Untap.dk,
        medmindre andet er angivet.
      </p>

      <h2>Acceptabel brug</h2>
      <p>
        Du må ikke misbruge sitet, forsøge at overbelaste vores eller
        tredjeparts API’er, eller bruge indholdet på en måde, der krænker
        andres rettigheder.
      </p>

      <h2>Kontakt</h2>
      <p>
        Spørgsmål til vilkårene:{" "}
        <a href="mailto:info@untap.dk">info@untap.dk</a>. Se også{" "}
        <Link href="/om">Om / Kontakt</Link> og{" "}
        <Link href="/privatliv">privatlivspolitikken</Link>.
      </p>
    </LegalPage>
  );
}
