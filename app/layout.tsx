import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { Header } from "@/components/Header";
import "./globals.css";

const display = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const sans = Manrope({
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
    "Den danske hub for Magic: The Gathering — dæklister, strategi og marked.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="da"
      className={`dark ${display.variable} ${sans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-ink text-parchment">
        <Header />
        {children}
      </body>
    </html>
  );
}
