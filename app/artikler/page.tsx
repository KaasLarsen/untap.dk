import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { getAllArticles } from "@/lib/content";

export const metadata: Metadata = {
  title: "Artikler",
  description: "Strategi, guides og nyheder fra untap.dk.",
};

export default function ArtiklerPage() {
  const articles = getAllArticles();

  return (
    <PageShell width="narrow">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
          Strategi
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-parchment sm:text-5xl">
          Artikler
        </h1>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-parchment-muted sm:text-lg">
          Guides og strategi fra content-mappen.
        </p>
      </div>

      <ul className="divide-y divide-line border-y border-line">
        {articles.map((article) => (
          <li key={article.slug} className="py-8">
            <time
              dateTime={article.date}
              className="text-xs font-medium uppercase tracking-wider text-parchment-muted"
            >
              {article.date}
            </time>
            <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-parchment">
              <Link
                href={`/artikler/${article.slug}`}
                className="transition-colors hover:text-accent"
              >
                {article.title}
              </Link>
            </h2>
            {article.excerpt ? (
              <p className="mt-3 text-parchment-muted">{article.excerpt}</p>
            ) : null}
          </li>
        ))}
      </ul>
    </PageShell>
  );
}
