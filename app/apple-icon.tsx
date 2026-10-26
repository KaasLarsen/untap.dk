import { ImageResponse } from "next/og";
import {
  UNTAP_ICON_COLORS,
  UNTAP_MARK_PATHS,
  UNTAP_MARK_STROKE_WIDTH,
  UNTAP_MARK_VIEWBOX,
} from "@/lib/untap-mark";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: UNTAP_ICON_COLORS.ink,
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg
          width="120"
          height="120"
          viewBox={UNTAP_MARK_VIEWBOX}
          fill="none"
        >
          <path
            d={UNTAP_MARK_PATHS.arc}
            stroke={UNTAP_ICON_COLORS.accent}
            strokeWidth={UNTAP_MARK_STROKE_WIDTH}
            strokeLinecap="round"
          />
          <path
            d={UNTAP_MARK_PATHS.chevron}
            stroke={UNTAP_ICON_COLORS.accent}
            strokeWidth={UNTAP_MARK_STROKE_WIDTH}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    ),
    { ...size },
  );
}
