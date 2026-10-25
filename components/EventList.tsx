import Link from "next/link";
import type { FormatEvent } from "@/lib/tournaments";

type EventListProps = {
  formatSlug: string;
  events: FormatEvent[];
};

export function EventList({ formatSlug, events }: EventListProps) {
  if (events.length === 0) {
    return (
      <p className="text-parchment-muted">
        Ingen turneringer fundet for dette format.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-line border-y border-line">
      {events.map((event) => (
        <li key={event.id}>
          <Link
            href={`/deck/f/${formatSlug}/event/${event.id}`}
            className="group block py-3.5 transition-colors hover:bg-ink-elevated"
          >
            <p className="font-display text-lg font-semibold tracking-tight text-parchment group-hover:text-accent">
              {event.name}
            </p>
            {event.location ? (
              <p className="mt-1 text-sm text-parchment-muted">
                {event.location}
              </p>
            ) : null}
          </Link>
        </li>
      ))}
    </ul>
  );
}
