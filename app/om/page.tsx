import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Om / Kontakt",
  description: "Hvad Untap.dk er, og hvordan du kontakter os.",
};

export default function OmPage() {
  return (
    <LegalPage
      title="Om / Kontakt"
      description="Kort om Untap.dk — og hvor du skriver hen."
    >
      <h2>Hvad er Untap.dk?</h2>
      <p>
        Untap.dk er en dansk indholdshub for Magic: The Gathering. Vi samler
        decklists, strategi og markedsinformation, så du hurtigere kan finde det,
        du leder efter.
      </p>
      <p>
        Untap.dk er <strong>ikke en webshop</strong>. Vi sælger ikke kort, packs
        eller merchandise. Vi viser affiliate-annoncer og links til eksterne
        butikker (via Partner Ads), så du kan købe hos forhandlere som
        NextLevelGames og Kelz0r. Se{" "}
        <Link href="/kilder">kilder &amp; data</Link> for listen.
      </p>

      <h2>Kontakt</h2>
      <p>
        Skriv til{" "}
        <a href="mailto:info@untap.dk">info@untap.dk</a>. Vi svarer så hurtigt,
        vi kan.
      </p>

      <h2>Virksomhedsoplysninger</h2>
      <p>
        Site/virksomhedsnavn: <strong>Untap.dk</strong>
      </p>
      <p>CVR-nummer er ikke oplyst på nuværende tidspunkt.</p>

      <h2>Se også</h2>
      <ul>
        <li>
          <Link href="/privatliv">Privatlivspolitik</Link>
        </li>
        <li>
          <Link href="/cookies">Cookies</Link>
        </li>
        <li>
          <Link href="/kilder">Kilder &amp; data</Link>
        </li>
        <li>
          <Link href="/vilkaar">Vilkår</Link>
        </li>
      </ul>
    </LegalPage>
  );
}
