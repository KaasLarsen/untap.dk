import Link from "next/link";

export function Hero() {
  return (
    <section className="hero-atmosphere relative flex min-h-[100svh] flex-col justify-center overflow-hidden">
      <div className="hero-texture pointer-events-none absolute inset-0" aria-hidden />

      <div
        className="animate-mana-drift pointer-events-none absolute inset-x-0 bottom-[18%] h-px origin-left bg-gradient-to-r from-transparent via-accent/70 to-transparent"
        aria-hidden
      />
      <div
        className="animate-mana-drift pointer-events-none absolute inset-x-[8%] bottom-[16%] h-[2px] origin-center rounded-full bg-gradient-to-r from-transparent via-accent-dim/40 to-transparent blur-[1px] delay-2"
        aria-hidden
      />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-5 pb-24 pt-28 sm:px-8 sm:pb-28 sm:pt-32">
        <p className="animate-fade-rise font-display text-5xl leading-none tracking-tight text-parchment sm:text-7xl md:text-8xl">
          untap.dk
        </p>
        <h1 className="animate-fade-rise delay-1 mt-5 font-display text-2xl font-normal tracking-wide text-accent-bright sm:text-3xl md:text-4xl">
          Untap, Upkeep, Draw.
        </h1>
        <p className="animate-fade-rise delay-2 mt-6 max-w-xl text-base leading-relaxed text-parchment-muted sm:text-lg">
          Den danske hub for Magic — decks, strategi og marked, bygget i mørket.
        </p>
        <div className="animate-fade-rise delay-3 mt-10 flex flex-wrap items-center gap-4">
          <Link
            href="/artikler"
            className="inline-flex items-center bg-accent px-5 py-3 text-sm font-medium text-ink transition-colors hover:bg-accent-bright"
          >
            Se artikler
          </Link>
          <Link
            href="#decklists"
            className="inline-flex items-center border border-line px-5 py-3 text-sm text-parchment-muted transition-colors hover:border-parchment-muted hover:text-parchment"
          >
            Se decklists
          </Link>
        </div>
      </div>
    </section>
  );
}
