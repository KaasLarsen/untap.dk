import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Privatlivspolitik",
  description: "Hvordan Untap.dk behandler personoplysninger.",
};

export default function PrivatlivPage() {
  return (
    <LegalPage
      title="Privatlivspolitik"
      description="Enkel fortrolighedspolitik for et indholdssite."
    >
      <h2>Dataansvarlig</h2>
      <p>
        Untap.dk er dataansvarlig for behandling af personoplysninger på dette
        website. Kontakt:{" "}
        <a href="mailto:info@untap.dk">info@untap.dk</a>.
      </p>

      <h2>Hvilke oplysninger behandler vi?</h2>
      <p>
        Untap.dk har ikke brugerkonti og indsamler ikke bevidst personoplysninger
        via formularer på sitet. Når du besøger siden, kan vores hosting
        (Vercel) behandle tekniske oplysninger, der er nødvendige for at levere
        siden — typisk IP-adresse, tidspunkt, browser/device og den anmodede
        URL — i serverlogs og driftsmålinger.
      </p>
      <p>
        Hvis du skriver til os på e-mail, behandler vi de oplysninger, du selv
        sender (fx navn og e-mailadresse), for at kunne besvare dig.
      </p>

      <h2>Formål og retsgrundlag</h2>
      <ul>
        <li>
          Drift og sikkerhed af websitet (legitim interesse / nødvendig
          behandling for at levere tjenesten).
        </li>
        <li>
          Besvarelse af henvendelser (legitim interesse / aftale, afhængigt af
          indholdet).
        </li>
      </ul>

      <h2>Analytics og markedsføring</h2>
      <p>
        Vi bruger <strong>ikke</strong> tredjeparts-analyseværktøjer (fx Google
        Analytics) eller markedsføringscookies på Untap.dk på nuværende
        tidspunkt. Hvis det ændrer sig, opdaterer vi denne politik og{" "}
        <Link href="/cookies">cookiepolitikken</Link>.
      </p>

      <h2>Videregivelse</h2>
      <p>
        Vi sælger ikke dine oplysninger. Hostingleverandører (fx Vercel) kan
        behandle tekniske data som led i driften. Datakilder som Scryfall,
        MTGTop8 m.fl. bruges til kort- og turneringsindhold — ikke til at
        profilere dig som bruger.
      </p>

      <h2>Opbevaring</h2>
      <p>
        Serverlogs opbevares så længe, det er nødvendigt for drift og
        fejlfinding. E-mailkorrespondance opbevares, så længe det er relevant
        for dialogen eller vores dokumentation.
      </p>

      <h2>Dine rettigheder</h2>
      <p>
        Du har efter GDPR ret til indsigt, berigtigelse, sletning, begrænsning,
        dataportabilitet og indsigelse, hvor betingelserne er opfyldt. Du kan
        også klage til Datatilsynet. Kontakt os på{" "}
        <a href="mailto:info@untap.dk">info@untap.dk</a>, hvis du vil gøre brug
        af dine rettigheder.
      </p>
    </LegalPage>
  );
}
