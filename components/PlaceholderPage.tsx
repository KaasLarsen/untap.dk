import Link from "next/link";

type PlaceholderPageProps = {
  title: string;
  description: string;
};

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <main className="mx-auto flex min-h-[70svh] max-w-3xl flex-col justify-center px-5 py-28 sm:px-8">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
        Kommer snart
      </p>
      <h1 className="mt-4 font-display text-4xl tracking-tight text-parchment sm:text-5xl">
        {title}
      </h1>
      <p className="mt-5 max-w-xl text-base leading-relaxed text-parchment-muted sm:text-lg">
        {description}
      </p>
      {/* TODO: Plug in Scryfall / price APIs when ready — no fake data here. */}
      <Link
        href="/"
        className="mt-10 inline-flex w-fit text-sm text-accent-bright underline-offset-4 hover:underline"
      >
        Tilbage til forsiden
      </Link>
    </main>
  );
}
