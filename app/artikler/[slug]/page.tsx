import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleBody } from "@/components/ArticleBody";
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
    <main className="mx-auto max-w-3xl px-5 py-28 sm:px-8">
      <Link
        href="/artikler"
        className="text-sm text-parchment-muted transition-colors hover:text-accent-bright"
      >
        ← Artikler
      </Link>
      <time
        dateTime={article.date}
        className="mt-8 block text-xs uppercase tracking-wider text-parchment-muted"
      >
        {article.date}
      </time>
      <h1 className="mt-3 font-display text-4xl tracking-tight text-parchment sm:text-5xl">
        {article.title}
      </h1>
      {article.excerpt ? (
        <p className="mt-5 text-lg text-parchment-muted">{article.excerpt}</p>
      ) : null}
      <div className="mt-12">
        <ArticleBody html={article.contentHtml} />
      </div>
    </main>
  );
}
