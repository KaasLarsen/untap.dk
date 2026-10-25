import type { ReactNode } from "react";

type PageShellProps = {
  children: ReactNode;
  className?: string;
  width?: "narrow" | "default" | "wide";
};

const widthClass = {
  narrow: "max-w-3xl",
  default: "max-w-5xl",
  wide: "max-w-6xl",
} as const;

export function PageShell({
  children,
  className = "",
  width = "wide",
}: PageShellProps) {
  return (
    <main
      className={`mx-auto flex w-full flex-1 flex-col gap-10 px-5 py-12 sm:px-8 sm:py-16 ${widthClass[width]} ${className}`}
    >
      {children}
    </main>
  );
}
