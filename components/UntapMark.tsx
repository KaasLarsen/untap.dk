import {
  UNTAP_MARK_PATHS,
  UNTAP_MARK_STROKE_WIDTH,
  UNTAP_MARK_VIEWBOX,
} from "@/lib/untap-mark";

type UntapMarkProps = {
  className?: string;
  title?: string;
};

/** Original curved untap-arrow mark — evocative, not a WotC glyph copy. */
export function UntapMark({ className, title }: UntapMarkProps) {
  const labelled = Boolean(title);

  return (
    <svg
      viewBox={UNTAP_MARK_VIEWBOX}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden={labelled ? undefined : true}
      role={labelled ? "img" : undefined}
      focusable="false"
    >
      {title ? <title>{title}</title> : null}
      <path
        d={UNTAP_MARK_PATHS.arc}
        stroke="currentColor"
        strokeWidth={UNTAP_MARK_STROKE_WIDTH}
        strokeLinecap="round"
      />
      <path
        d={UNTAP_MARK_PATHS.chevron}
        stroke="currentColor"
        strokeWidth={UNTAP_MARK_STROKE_WIDTH}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
