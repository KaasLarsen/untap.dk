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
        className="group flex w-full items-baseline gap-3 rounded-sm px-2 py-1.5 text-left transition-colors hover:bg-white/5 focus-visible:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400/70"
        aria-describedby={open ? tooltipId : undefined}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        <span className="w-7 shrink-0 font-mono text-sm tabular-nums text-zinc-500 transition-colors group-hover:text-amber-400/90">
          {quantity}
        </span>
        <span className="text-[15px] tracking-tight text-zinc-100 transition-colors group-hover:text-white">
          {name}
        </span>
      </button>

      {open && imageUrl ? (
        <div
          id={tooltipId}
          role="tooltip"
          className="pointer-events-none absolute left-full top-0 z-20 ml-3 w-60 animate-in fade-in duration-150"
        >
          <div className="overflow-hidden rounded-lg border border-zinc-700/80 bg-zinc-950 shadow-2xl shadow-black/60 ring-1 ring-white/10">
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
              <p className="border-t border-zinc-800 px-3 py-2 text-xs text-zinc-400">
                {typeLine}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </li>
  );
}
