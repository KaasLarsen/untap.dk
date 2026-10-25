import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { DeckRefList } from "@/components/DeckRefList";
import { FormatMenu } from "@/components/FormatMenu";
import { PageShell } from "@/components/PageShell";
import { getFormatBySlug } from "@/lib/formats";
import { getEventDecks } from "@/lib/tournaments";

type PageProps = {
  params: Promise<{ format: string; eventId: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { format: slug, eventId } = await params;
  const format = getFormatBySlug(slug);
  if (!format) return { title: "Event" };

  const event = await getEventDecks(format.code, eventId);
  return {
    title: event.tournamentName || "Event",
    description: `Top-decks fra ${event.tournamentName} (${format.label}).`,
  };
}

function PageFallback() {
  return (
    <PageShell>
      <div className="h-10 w-72 animate-pulse bg-ink-soft" />
      <div className="h-64 animate-pulse bg-ink-soft/60" />
    </PageShell>
  );
}

async function EventDeckPanel({
  formatSlug,
  formatCode,
  eventId,
}: {
  formatSlug: string;
  formatCode: string;
  eventId: string;
}) {
  const event = await getEventDecks(formatCode, eventId);
  return (
    <DeckRefList
      decks={event.decks}
      formatSlug={formatSlug}
      emptyLabel="Ingen decklists publiceret for dette event endnu."
    />
  );
}

async function EventContent({ params }: PageProps) {
  const { format: slug, eventId } = await params;
  const format = getFormatBySlug(slug);
  if (!format) notFound();

  const event = await getEventDecks(format.code, eventId);
  if (!event.tournamentName && event.decks.length === 0) notFound();

  return (
    <PageShell>
      <div className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
          {format.label}
          {event.date ? ` · ${event.date}` : ""}
        </p>
        <h1 className="font-display text-4xl font-semibold tracking-tight text-parchment sm:text-5xl">
          {event.tournamentName}
        </h1>
        <p className="max-w-2xl text-base text-parchment-muted">
          Top-decks fra eventet — vælg et deck for at se listen.
        </p>
      </div>

      <FormatMenu activeSlug={format.slug} />

      <Suspense
        fallback={<div className="h-64 animate-pulse bg-ink-soft/60" />}
      >
        <EventDeckPanel
          formatSlug={format.slug}
          formatCode={format.code}
          eventId={eventId}
        />
      </Suspense>

      <p>
        <Link
          href={`/deck/f/${format.slug}?view=events`}
          className="text-sm font-medium text-accent underline-offset-4 hover:underline"
        >
          ← Tilbage til {format.label} turneringer
        </Link>
      </p>
    </PageShell>
  );
}

export default function EventPage(props: PageProps) {
  return (
    <Suspense fallback={<PageFallback />}>
      <EventContent {...props} />
    </Suspense>
  );
}
