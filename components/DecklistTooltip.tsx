"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";

type DecklistTooltipProps = {
  name: string;
  quantity: number;
  imageUrl?: string;
  typeLine?: string;
};

type PanelPos = {
  top: number;
  left: number;
};

const PANEL_WIDTH = 244;
const PANEL_HEIGHT = 360;

export function DecklistTooltip({
  name,
  quantity,
  imageUrl,
  typeLine,
}: DecklistTooltipProps) {
  const tooltipId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<PanelPos>({ top: 0, left: 0 });

  useEffect(() => {
    if (!open || !buttonRef.current) return;

    const update = () => {
      const rect = buttonRef.current!.getBoundingClientRect();
      const margin = 12;
      const spaceRight = window.innerWidth - rect.right - margin;
      const placeLeft = spaceRight < PANEL_WIDTH && rect.left > PANEL_WIDTH;

      let left = placeLeft
        ? rect.left - PANEL_WIDTH - margin
        : rect.right + margin;
      left = Math.max(
        margin,
        Math.min(left, window.innerWidth - PANEL_WIDTH - margin),
      );

      let top = rect.top;
      top = Math.max(
        margin,
        Math.min(top, window.innerHeight - PANEL_HEIGHT - margin),
      );

      setPos({ top, left });
    };

    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const onPointer = (event: MouseEvent) => {
      if (!(event.target instanceof Node)) return;
      if (buttonRef.current?.contains(event.target)) return;
      const panel = document.getElementById(tooltipId);
      if (panel?.contains(event.target)) return;
      setOpen(false);
    };

    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onPointer);
    };
  }, [open, tooltipId]);

  return (
    <li className="relative">
      <button
        ref={buttonRef}
        type="button"
        className="group flex w-full items-baseline gap-3 rounded-sm px-2 py-1.5 text-left transition-colors hover:bg-parchment/5 focus-visible:bg-parchment/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        aria-expanded={open}
        aria-controls={open ? tooltipId : undefined}
        onClick={() => {
          if (!imageUrl) return;
          setOpen((value) => !value);
        }}
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
          role="dialog"
          aria-label={name}
          className="fixed z-50 w-60 animate-fade-in"
          style={{ top: pos.top, left: pos.left }}
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
