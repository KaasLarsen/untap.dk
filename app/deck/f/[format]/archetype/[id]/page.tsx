import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { DeckRefList } from "@/components/DeckRefList";
import { FormatMenu } from "@/components/FormatMenu";
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
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-5 py-16 sm:px-8 sm:py-24">
      <div className="h-10 w-64 animate-pulse bg-ink-elevated" />
      <div className="h-64 animate-pulse border border-line bg-ink-elevated/40" />
    </main>
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
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-5 py-16 sm:px-8 sm:py-24">
      <div className="space-y-5">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
          {format.label} · {archetype.share}% af meta
        </p>
        <h1 className="font-display text-4xl tracking-tight text-parchment sm:text-5xl">
          {archetype.name}
        </h1>
        <p className="max-w-2xl text-base text-parchment-muted">
          Seneste dæk af typen — klik ind for fuld liste og kortbilleder.
        </p>
        <FormatMenu activeSlug={format.slug} />
      </div>

      <Suspense
        fallback={
          <div className="h-64 animate-pulse border border-line bg-ink-elevated/40" />
        }
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
          className="text-sm text-accent-bright underline-offset-4 hover:underline"
        >
          ← Tilbage til {format.label} metagame
        </Link>
      </p>
    </main>
  );
}

export default function ArchetypePage(props: PageProps) {
  return (
    <Suspense fallback={<PageFallback />}>
      <ArchetypeContent {...props} />
    </Suspense>
  );
}
