"use client";

import Image from "next/image";
import { useId, useState } from "react";

type DecklistTooltipProps = {
  name: string;
  quantity: number;
  imageUrl?: string;
  typeLine?: string;
};

export function DecklistTooltip({
  name,
  quantity,
  imageUrl,
  typeLine,
}: DecklistTooltipProps) {
  const tooltipId = useId();
  const [open, setOpen] = useState(false);

  return (
    <li className="relative">
      <button
        type="button"
        className="group flex w-full items-baseline gap-3 rounded-sm px-2 py-1.5 text-left transition-colors hover:bg-parchment/5 focus-visible:bg-parchment/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        aria-describedby={open ? tooltipId : undefined}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        <span className="w-7 shrink-0 font-mono text-sm tabular-nums text-parchment-muted transition-colors group-hover:text-accent-bright">
          {quantity}
        </span>
        <span className="text-[15px] tracking-tight text-parchment transition-colors group-hover:text-parchment">
          {name}
        </span>
      </button>

      {open && imageUrl ? (
        <div
          id={tooltipId}
          role="tooltip"
          className="pointer-events-none absolute left-full top-0 z-20 ml-3 w-60 animate-fade-in"
        >
          <div className="overflow-hidden rounded-lg border border-line bg-ink-elevated shadow-2xl shadow-black/60">
            <Image
              src={imageUrl}
              alt={name}
              width={244}
              height={340}
              className="h-auto w-full max-w-none"
              unoptimized
              priority
            />
            {typeLine ? (
              <p className="border-t border-line px-3 py-2 text-xs text-parchment-muted">
                {typeLine}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </li>
  );
}
