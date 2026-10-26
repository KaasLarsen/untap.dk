import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Cookies",
  description: "Cookiepolitik for Untap.dk — hvad der faktisk bruges.",
};

export default function CookiesPage() {
  return (
    <LegalPage
      title="Cookies"
      description="Kort om cookies og lignende teknikker på Untap.dk."
    >
      <h2>Status</h2>
      <p>
        Untap.dk sætter <strong>ikke</strong> egne analyse- eller
        markedsføringscookies. Vi har heller ikke et cookiebanner, fordi vi ikke
        bruger ikke-nødvendige cookies til tracking.
      </p>

      <h2>Nødvendig drift</h2>
      <p>
        Når du besøger sitet, kan hostingleverandøren (Vercel) anvende tekniske
        mekanismer, der er nødvendige for at levere og sikre websitet — fx
        midlertidige session-/sikkerhedsrelaterede cookies eller edge-caching.
        Det er ikke til profilering.
      </p>

      <h2>Lokale data i browseren</h2>
      <p>
        Nogle sider kan gemme midlertidige indstillinger i din browser (fx
        session storage), så en søgning eller UI-tilstand huskes under dit
        besøg. Det sendes ikke til os som et separat analytics-produkt.
      </p>

      <h2>Ændringer</h2>
      <p>
        Hvis vi senere tilføjer analyse eller andre cookies, opdaterer vi denne
        side og{" "}
        <Link href="/privatliv">privatlivspolitikken</Link>, og vi indhenter
        samtykke, hvor loven kræver det.
      </p>

      <h2>Kontakt</h2>
      <p>
        Spørgsmål?{" "}
        <a href="mailto:info@untap.dk">info@untap.dk</a>
      </p>
    </LegalPage>
  );
}
