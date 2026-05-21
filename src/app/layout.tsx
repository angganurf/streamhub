import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StreamHub - Premium Video Directory",
  description: "Discover the best videos on StreamHub",
};

import { GlobalAdsRenderer } from "@/components/ads/GlobalAdsRenderer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased dark"
      suppressHydrationWarning
    >
      <body
        className="min-h-full flex flex-col"
        style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
        suppressHydrationWarning
      >
        <GlobalAdsRenderer />
        {children}
      </body>
    </html>
  );
}
