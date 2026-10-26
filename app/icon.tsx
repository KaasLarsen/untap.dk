import { ImageResponse } from "next/og";
import {
  UNTAP_ICON_COLORS,
  UNTAP_MARK_PATHS,
  UNTAP_MARK_STROKE_WIDTH,
  UNTAP_MARK_VIEWBOX,
} from "@/lib/untap-mark";

export const size = {
  width: 32,
  height: 32,
};

export const contentType = "image/png";

export default function Icon() {
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
          width="22"
          height="22"
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
