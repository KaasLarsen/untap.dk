import type { Metadata } from "next";
import { Figtree, Space_Grotesk } from "next/font/google";
import { Suspense } from "react";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import "./globals.css";

const display = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const sans = Figtree({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "untap.dk — Untap, Upkeep, Draw.",
    template: "%s · untap.dk",
  },
  description:
    "Den danske hub for Magic: The Gathering — decks, strategi og marked.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="da"
      className={`${display.variable} ${sans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-ink text-parchment">
        <Suspense
          fallback={
            <header className="sticky top-0 z-30 h-14 border-b border-line/80 bg-ink-elevated/80 sm:h-16" />
          }
        >
          <Header />
        </Suspense>
        <div className="flex flex-1 flex-col">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
