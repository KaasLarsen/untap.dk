import Link from "next/link";
import type { MetagameArchetype } from "@/lib/tournaments";

type MetagameListProps = {
  formatSlug: string;
  archetypes: MetagameArchetype[];
};

export function MetagameList({ formatSlug, archetypes }: MetagameListProps) {
  if (archetypes.length === 0) {
    return (
      <p className="text-parchment-muted">
        Ingen metagame-data lige nu for dette format.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-line border border-line">
      {archetypes.map((archetype) => (
        <li key={`${archetype.id}-${archetype.meta}`}>
          <Link
            href={`/deck/f/${formatSlug}/archetype/${archetype.id}?meta=${archetype.meta}`}
            className="group flex items-center gap-4 px-4 py-3 transition-colors hover:bg-ink-elevated/80"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-lg text-parchment group-hover:text-accent-bright">
                {archetype.name}
              </p>
              <div className="mt-2 h-1.5 overflow-hidden bg-ink-soft">
                <div
                  className="h-full bg-accent/80 transition-all"
                  style={{
                    width: `${Math.min(100, Math.max(2, archetype.share))}%`,
                  }}
                />
              </div>
            </div>
            <span className="shrink-0 font-mono text-sm tabular-nums text-accent">
              {formatShare(archetype.share)}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function formatShare(share: number) {
  return `${share % 1 === 0 ? share.toFixed(0) : share.toFixed(1)}%`;
}
