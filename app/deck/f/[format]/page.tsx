import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { EventList } from "@/components/EventList";
import { FormatMenu } from "@/components/FormatMenu";
import { FormatViewTabs } from "@/components/FormatViewTabs";
import { MetagameList } from "@/components/MetagameList";
import { getFormatBySlug } from "@/lib/formats";
import { getFormatEvents, getFormatMetagame } from "@/lib/tournaments";

type PageProps = {
  params: Promise<{ format: string }>;
  searchParams: Promise<{ view?: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { format: slug } = await params;
  const format = getFormatBySlug(slug);
  if (!format) return { title: "Format ikke fundet" };
  return {
    title: `${format.label} decks`,
    description: `Metagame og turneringer i ${format.label} på untap.dk.`,
  };
}

function ListFallback() {
  return (
    <div className="space-y-2 border border-line p-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="h-10 animate-pulse bg-ink-elevated/60" />
      ))}
    </div>
  );
}

function PageFallback() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-5 py-16 sm:px-8 sm:py-24">
      <div className="h-10 w-48 animate-pulse bg-ink-elevated" />
      <ListFallback />
    </main>
  );
}

async function MetagamePanel({
  formatSlug,
  formatCode,
}: {
  formatSlug: string;
  formatCode: string;
}) {
  const archetypes = await getFormatMetagame(formatCode);
  return <MetagameList formatSlug={formatSlug} archetypes={archetypes} />;
}

async function EventsPanel({
  formatSlug,
  formatCode,
}: {
  formatSlug: string;
  formatCode: string;
}) {
  const events = await getFormatEvents(formatCode);
  return <EventList formatSlug={formatSlug} events={events} />;
}

async function FormatHub({ params, searchParams }: PageProps) {
  const { format: slug } = await params;
  const { view } = await searchParams;
  const format = getFormatBySlug(slug);
  if (!format) notFound();

  const active = view === "events" ? "events" : "metagame";

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-5 py-16 sm:px-8 sm:py-24">
      <div className="space-y-5">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
          Format
        </p>
        <h1 className="font-display text-4xl tracking-tight text-parchment sm:text-5xl">
          {format.label}
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-parchment-muted sm:text-lg">
          Vælg format, se metagame-fordeling i procent, eller gå ind i en
          turnering og kig top-decks.
        </p>
        <FormatMenu activeSlug={format.slug} />
      </div>

      <FormatViewTabs formatSlug={format.slug} active={active} />

      <Suspense fallback={<ListFallback />}>
        {active === "events" ? (
          <EventsPanel formatSlug={format.slug} formatCode={format.code} />
        ) : (
          <MetagamePanel formatSlug={format.slug} formatCode={format.code} />
        )}
      </Suspense>

      <p>
        <Link
          href="/"
          className="text-sm text-accent-bright underline-offset-4 hover:underline"
        >
          ← Tilbage til forsiden
        </Link>
      </p>
    </main>
  );
}

export default function FormatHubPage(props: PageProps) {
  return (
    <Suspense fallback={<PageFallback />}>
      <FormatHub {...props} />
    </Suspense>
  );
}
