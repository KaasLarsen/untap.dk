import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleBody } from "@/components/ArticleBody";
import { PageShell } from "@/components/PageShell";
import { getArticleBySlug, getArticleSlugs } from "@/lib/content";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return getArticleSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    return { title: "Ikke fundet" };
  }

  return {
    title: article.title,
    description: article.excerpt,
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  return (
    <PageShell width="narrow">
      <div>
        <Link
          href="/artikler"
          className="text-sm font-medium text-parchment-muted transition-colors hover:text-accent"
        >
          ← Artikler
        </Link>
        <time
          dateTime={article.date}
          className="mt-8 block text-xs font-medium uppercase tracking-wider text-parchment-muted"
        >
          {article.date}
        </time>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-parchment sm:text-5xl">
          {article.title}
        </h1>
        {article.excerpt ? (
          <p className="mt-5 text-lg text-parchment-muted">{article.excerpt}</p>
        ) : null}
      </div>
      <div>
        <ArticleBody html={article.contentHtml} />
      </div>
    </PageShell>
  );
}
