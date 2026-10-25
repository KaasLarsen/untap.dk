type UntapMarkProps = {
  className?: string;
  title?: string;
};

/** Original curved untap-arrow mark — evocative, not a WotC glyph copy. */
export function UntapMark({ className, title }: UntapMarkProps) {
  const labelled = Boolean(title);

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden={labelled ? undefined : true}
      role={labelled ? "img" : undefined}
      focusable="false"
    >
      {title ? <title>{title}</title> : null}
      <path
        d="M6.4 17.2a7.6 7.6 0 1 1 11.9-7.1"
        stroke="currentColor"
        strokeWidth="2.15"
        strokeLinecap="round"
      />
      <path
        d="M18.3 10.1v4.4h-4.4"
        stroke="currentColor"
        strokeWidth="2.15"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
