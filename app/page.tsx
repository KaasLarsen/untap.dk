import Link from "next/link";
import { Hero } from "@/components/Hero";
import { Section } from "@/components/Section";
import { getArticleBySlug } from "@/lib/content";

export default async function Home() {
  const welcome = await getArticleBySlug("welcome-post");

  return (
    <>
      <Hero />

      <Section id="daeklister" eyebrow="Søjle 01" title="Dæklister">
        <p>
          Overblik over, hvad der spilles, og hvad der er værd at prøve — fra
          Standard til Commander. Listen vokser, når data og Scryfall-integration
          er klar.
        </p>
        <p className="mt-4">
          <Link href="/daek" className="text-accent-bright underline-offset-4 hover:underline">
            Dæk — kommer snart
          </Link>
        </p>
      </Section>

      <Section id="strategi" eyebrow="Søjle 02" title="Strategi">
        <p>
          Artikler og guides, der gør dig skarpere ved bordet. Start med vores
          velkomstindlæg, og følg med når flere tekster lander under Artikler.
        </p>
        <p className="mt-4">
          {welcome ? (
            <Link
              href={`/artikler/${welcome.slug}`}
              className="text-accent-bright underline-offset-4 hover:underline"
            >
              Læs: {welcome.title}
            </Link>
          ) : (
            <Link href="/artikler" className="text-accent-bright underline-offset-4 hover:underline">
              Se artikler
            </Link>
          )}
        </p>
      </Section>

      <Section id="marked" eyebrow="Søjle 03" title="Marked">
        <p>
          Priser og købsvejledning, så du ved, hvad dine kort er værd — uden
          støj. Markedsdelen kommer, når prisfeeds er på plads.
        </p>
        <p className="mt-4">
          <Link href="/marked" className="text-accent-bright underline-offset-4 hover:underline">
            Marked — kommer snart
          </Link>
        </p>
      </Section>

      <Section id="affiliate" eyebrow="Mission" title="Støt via Kelz0r">
        <p>
          Når du køber via vores links, støtter du siden. Vi samarbejder med
          Kelz0r og andre partnere, så anbefalingerne også kan bære driften —
          ærligt markeret, uden at skjule hvorfor linket er der.
        </p>
        {/* TODO: Affiliate click tracking + Kelz0r deep links when ready. */}
      </Section>

      <footer className="border-t border-line px-5 py-10 text-center text-sm text-parchment-muted sm:px-8">
        <p className="font-display text-lg text-parchment">untap.dk</p>
        <p className="mt-2">Vi bygger i mørket. Untap, Upkeep, Draw.</p>
      </footer>
    </>
  );
}
