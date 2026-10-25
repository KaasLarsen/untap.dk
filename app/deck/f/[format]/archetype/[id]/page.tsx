import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { DeckRefList } from "@/components/DeckRefList";
import { FormatMenu } from "@/components/FormatMenu";
import { PageShell } from "@/components/PageShell";
import { getFormatBySlug } from "@/lib/formats";
import {
  getArchetypeDeckRefs,
  getFormatMetagame,
} from "@/lib/tournaments";

type PageProps = {
  params: Promise<{ format: string; id: string }>;
  searchParams: Promise<{ meta?: string }>;
};

export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  const { format: slug, id } = await params;
  const { meta } = await searchParams;
  const format = getFormatBySlug(slug);
  if (!format) return { title: "Archetype" };

  const archetypes = await getFormatMetagame(format.code);
  const archetype = archetypes.find(
    (item) => item.id === id && (!meta || item.meta === meta),
  );

  return {
    title: archetype?.name || "Archetype",
    description: `${archetype?.name || "Archetype"} decks i ${format.label}.`,
  };
}

function PageFallback() {
  return (
    <PageShell>
      <div className="h-10 w-64 animate-pulse bg-ink-soft" />
      <div className="h-64 animate-pulse bg-ink-soft/60" />
    </PageShell>
  );
}

async function ArchetypeDecks({
  formatSlug,
  formatCode,
  archetypeId,
  meta,
}: {
  formatSlug: string;
  formatCode: string;
  archetypeId: string;
  meta: string;
}) {
  const decks = await getArchetypeDeckRefs(formatCode, archetypeId, meta);
  return <DeckRefList decks={decks} formatSlug={formatSlug} />;
}

async function ArchetypeContent({ params, searchParams }: PageProps) {
  const { format: slug, id } = await params;
  const { meta: metaParam } = await searchParams;
  const format = getFormatBySlug(slug);
  if (!format) notFound();

  const archetypes = await getFormatMetagame(format.code);
  const archetype =
    archetypes.find(
      (item) => item.id === id && (!metaParam || item.meta === metaParam),
    ) || archetypes.find((item) => item.id === id);

  if (!archetype) notFound();

  return (
    <PageShell>
      <div className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
          {format.label} · {archetype.share}% af meta
        </p>
        <h1 className="font-display text-4xl font-semibold tracking-tight text-parchment sm:text-5xl">
          {archetype.name}
        </h1>
        <p className="max-w-2xl text-base text-parchment-muted">
          Seneste decks af typen — klik ind for fuld liste og kortbilleder.
        </p>
      </div>

      <FormatMenu activeSlug={format.slug} />

      <Suspense
        fallback={<div className="h-64 animate-pulse bg-ink-soft/60" />}
      >
        <ArchetypeDecks
          formatSlug={format.slug}
          formatCode={format.code}
          archetypeId={archetype.id}
          meta={archetype.meta}
        />
      </Suspense>

      <p>
        <Link
          href={`/deck/f/${format.slug}`}
          className="text-sm font-medium text-accent underline-offset-4 hover:underline"
        >
          ← Tilbage til {format.label} metagame
        </Link>
      </p>
    </PageShell>
  );
}

export default function ArchetypePage(props: PageProps) {
  return (
    <Suspense fallback={<PageFallback />}>
      <ArchetypeContent {...props} />
    </Suspense>
  );
}
