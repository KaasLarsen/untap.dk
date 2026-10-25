import Link from "next/link";
import { PageShell } from "@/components/PageShell";

type PlaceholderPageProps = {
  title: string;
  description: string;
};

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <PageShell width="narrow" className="justify-center">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
          Kommer snart
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-parchment sm:text-5xl">
          {title}
        </h1>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-parchment-muted sm:text-lg">
          {description}
        </p>
        {/* TODO: Plug in Scryfall / price APIs when ready — no fake data here. */}
        <Link
          href="/"
          className="mt-10 inline-flex w-fit text-sm font-medium text-accent underline-offset-4 hover:underline"
        >
          Tilbage til forsiden
        </Link>
      </div>
    </PageShell>
  );
}
