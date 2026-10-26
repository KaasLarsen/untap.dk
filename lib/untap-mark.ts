/** Shared Untap mark geometry — keep favicon and UI mark in sync. */
export const UNTAP_MARK_VIEWBOX = "0 0 24 24";

export const UNTAP_MARK_STROKE_WIDTH = 2.15;

export const UNTAP_MARK_PATHS = {
  arc: "M6.4 17.2a7.6 7.6 0 1 1 11.9-7.1",
  chevron: "M18.3 10.1v4.4h-4.4",
} as const;

/** Brand tokens for static icon generation (ImageResponse). */
export const UNTAP_ICON_COLORS = {
  ink: "#f4f7f9",
  accent: "#0f766e",
} as const;
