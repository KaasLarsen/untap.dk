import type { Metadata } from "next";
import Link from "next/link";
import { getAllArticles } from "@/lib/content";

export const metadata: Metadata = {
  title: "Artikler",
  description: "Strategi, guides og nyheder fra untap.dk.",
};

export default function ArtiklerPage() {
  const articles = getAllArticles();

  return (
    <main className="mx-auto max-w-3xl px-5 py-28 sm:px-8">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
        Strategi
      </p>
      <h1 className="mt-4 font-display text-4xl tracking-tight text-parchment sm:text-5xl">
        Artikler
      </h1>
      <p className="mt-5 max-w-xl text-base leading-relaxed text-parchment-muted sm:text-lg">
        Tekster fra content-mappen — ingen CMS endnu, bare Markdown.
      </p>

      <ul className="mt-14 space-y-10">
        {articles.map((article) => (
          <li key={article.slug} className="border-t border-line pt-8">
            <time
              dateTime={article.date}
              className="text-xs uppercase tracking-wider text-parchment-muted"
            >
              {article.date}
            </time>
            <h2 className="mt-2 font-display text-2xl text-parchment">
              <Link
                href={`/artikler/${article.slug}`}
                className="transition-colors hover:text-accent-bright"
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
    </main>
  );
}
