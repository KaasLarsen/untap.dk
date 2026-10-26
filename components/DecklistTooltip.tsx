"use client";

import Image from "next/image";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { createPortal } from "react-dom";

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

function canHoverPreview(): boolean {
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

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
  const [mounted, setMounted] = useState(false);
  const hasImage = Boolean(imageUrl);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  function openPreview() {
    if (!hasImage) return;
    setOpen(true);
  }

  function onClick(event: ReactMouseEvent<HTMLButtonElement>) {
    if (!hasImage) return;
    // Desktop hover already shows the preview; click is for touch / keyboard.
    if (canHoverPreview() && open) return;
    event.preventDefault();
    setOpen((value) => !value);
  }

  const panel =
    open && imageUrl && mounted
      ? createPortal(
          <div
            id={tooltipId}
            role="dialog"
            aria-label={name}
            className="pointer-events-none fixed z-[100] w-60 animate-fade-in"
            style={{ top: pos.top, left: pos.left }}
          >
            <div className="overflow-hidden rounded-lg border border-line bg-ink-elevated shadow-xl shadow-parchment/10">
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
          </div>,
          document.body,
        )
      : null;

  return (
    <li className="relative">
      <button
        ref={buttonRef}
        type="button"
        disabled={!hasImage}
        className={`group flex w-full items-baseline gap-3 rounded-md px-2 py-1.5 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
          hasImage
            ? "cursor-pointer hover:bg-ink-soft focus-visible:bg-ink-soft"
            : "cursor-default opacity-90"
        }`}
        aria-expanded={open}
        aria-controls={open ? tooltipId : undefined}
        aria-haspopup={hasImage ? "dialog" : undefined}
        onMouseEnter={() => {
          if (canHoverPreview()) openPreview();
        }}
        onMouseLeave={() => {
          if (canHoverPreview()) setOpen(false);
        }}
        onFocus={() => {
          if (canHoverPreview()) openPreview();
        }}
        onBlur={() => {
          if (canHoverPreview()) setOpen(false);
        }}
        onClick={onClick}
      >
        <span
          className={`w-7 shrink-0 font-mono text-sm tabular-nums text-parchment-muted transition-colors ${
            hasImage ? "group-hover:text-accent" : ""
          }`}
        >
          {quantity}
        </span>
        <span
          className={`text-[15px] tracking-tight text-parchment transition-colors ${
            hasImage ? "group-hover:text-accent" : ""
          }`}
        >
          {name}
        </span>
      </button>
      {panel}
    </li>
  );
}
