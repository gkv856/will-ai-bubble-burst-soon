import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: "Will the AI Bubble Burst? | Real-Time Risk Tracker",
  description: "A data-driven dashboard tracking 8 macro and sentiment signals to measure the probability of an AI market bubble. Updated weekly with GPU prices, credit spreads, valuation, FOMO index, and more.",
  keywords: ["AI bubble", "AI market risk", "tech bubble tracker", "GPU prices", "AI valuation", "market risk dashboard"],
  authors: [{ name: "Will AI Bubble Burst" }],
  openGraph: {
    title: "Will the AI Bubble Burst?",
    description: "Real-time composite risk tracker built from 8 macro & sentiment signals.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", inter.variable)} suppressHydrationWarning>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
