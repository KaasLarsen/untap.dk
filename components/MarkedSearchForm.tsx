import type { ReactNode } from "react";

type MarkedSearchFormProps = {
  q: string;
  tab: "kort" | "serier";
};

export function MarkedSearchForm({ q, tab }: MarkedSearchFormProps) {
  return (
    <form
      action="/marked"
      method="get"
      className="mt-10 flex w-full flex-col gap-4"
      role="search"
    >
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Søgetype">
        <TabLink active={tab === "kort"} href={tabHref("kort", q)}>
          Kort
        </TabLink>
        <TabLink active={tab === "serier"} href={tabHref("serier", q)}>
          Serier
        </TabLink>
        <input type="hidden" name="tab" value={tab} />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <label className="sr-only" htmlFor="marked-q">
          {tab === "serier" ? "Søg efter serie" : "Søg efter kort"}
        </label>
        <input
          id="marked-q"
          name="q"
          type="search"
          defaultValue={q}
          placeholder={
            tab === "serier"
              ? "Fx Modern Horizons, mh3…"
              : "Fx Force of Negation…"
          }
          autoComplete="off"
          className="min-h-12 flex-1 border border-line bg-ink-elevated/80 px-4 text-base text-parchment outline-none transition-[border-color,box-shadow] placeholder:text-parchment-muted/70 focus:border-accent/50 focus:shadow-[0_0_0_1px_rgba(15,118,110,0.35)]"
        />
        <button
          type="submit"
          className="min-h-12 shrink-0 border border-accent/40 bg-accent/15 px-6 text-sm font-medium tracking-wide text-accent-bright transition-colors hover:bg-accent/25"
        >
          Søg
        </button>
      </div>

      <p className="text-sm text-parchment-muted">
        {tab === "serier"
          ? "Søg efter serienavn eller kode."
          : "Søg efter kortnavn."}
      </p>
    </form>
  );
}

function tabHref(tab: "kort" | "serier", q: string): string {
  const params = new URLSearchParams();
  params.set("tab", tab);
  if (q.trim()) params.set("q", q.trim());
  return `/marked?${params.toString()}`;
}

function TabLink({
  active,
  href,
  children,
}: {
  active: boolean;
  href: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      role="tab"
      aria-selected={active}
      className={
        active
          ? "border border-accent/50 bg-accent/15 px-3 py-1.5 text-sm text-accent-bright"
          : "border border-line px-3 py-1.5 text-sm text-parchment-muted transition-colors hover:border-line hover:text-parchment"
      }
    >
      {children}
    </a>
  );
}
