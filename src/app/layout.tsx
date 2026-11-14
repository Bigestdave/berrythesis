import type { Metadata } from "next";
import { Geist, Geist_Mono, DM_Sans } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Berry Thesis — The long-term case for NEAR",
  description:
    "One protocol. An open research question. Explore an evidence-first investment thesis on NEAR with sourced market data, reproducible queries, and a transparent research notebook.",
  applicationName: "Berry Thesis",
  icons: { icon: "/icon.svg" },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${dmSans.variable}`}
    >
      <body className="antialiased">
        {children}
        <script src="/demo-director.js" defer />
      </body>
    </html>
  );
}
