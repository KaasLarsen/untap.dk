import Link from "next/link";
import { UntapMark } from "@/components/UntapMark";

export function Hero() {
  return (
    <section className="hero-atmosphere relative flex min-h-[88svh] flex-col justify-center overflow-hidden">
      <div className="hero-texture pointer-events-none absolute inset-0" aria-hidden />
      <div className="hero-motif pointer-events-none absolute inset-0 opacity-80" aria-hidden />

      <div
        className="animate-mana-drift pointer-events-none absolute inset-x-0 bottom-[18%] h-px origin-left bg-gradient-to-r from-transparent via-accent/50 to-transparent"
        aria-hidden
      />
      <div
        className="animate-mana-drift pointer-events-none absolute inset-x-[8%] bottom-[16%] h-[2px] origin-center rounded-full bg-gradient-to-r from-transparent via-accent-bright/30 to-transparent blur-[1px] delay-2"
        aria-hidden
      />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-5 pb-20 pt-16 sm:px-8 sm:pb-24 sm:pt-20">
        <div className="animate-fade-rise flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-5 md:gap-6">
          <UntapMark className="size-12 shrink-0 text-accent sm:size-16 md:size-20" />
          <p className="font-display text-5xl font-semibold leading-none tracking-tight text-parchment sm:text-7xl md:text-8xl">
            untap.dk
          </p>
        </div>
        <h1 className="animate-fade-rise delay-1 mt-5 font-display text-2xl font-medium tracking-tight text-accent sm:text-3xl md:text-4xl">
          Untap, Upkeep, Draw.
        </h1>
        <p className="animate-fade-rise delay-2 mt-6 max-w-xl text-base leading-relaxed text-parchment-muted sm:text-lg">
          Den danske hub for Magic — decks, strategi og marked. Find metagame,
          turneringer og artikler ét sted.
        </p>
        <div className="animate-fade-rise delay-3 mt-10 flex flex-wrap items-center gap-3">
          <Link
            href="/deck/f/modern"
            className="inline-flex items-center bg-accent px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-bright"
          >
            Se decks
          </Link>
          <Link
            href="/artikler"
            className="inline-flex items-center border border-line bg-ink-elevated px-5 py-3 text-sm font-medium text-parchment transition-colors hover:border-accent/40 hover:text-accent"
          >
            Læs artikler
          </Link>
        </div>
      </div>
    </section>
  );
}
