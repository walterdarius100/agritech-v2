import type { Metadata } from "next";
import type { ReactNode } from "react";

import { PublicChrome } from "@/components/layout/PublicChrome";
import { siteConfig } from "@/config/site";
import { ClarityScript } from "@/lib/analytics/clarity";
import { GoogleAnalyticsScript } from "@/lib/analytics/google-analytics";
import { env } from "@/lib/env";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(env.siteUrl),
  title: {
    default: `${siteConfig.name} V2`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  alternates: { canonical: "/" },
  openGraph: {
    title: `${siteConfig.name} V2`,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} V2`,
    description: siteConfig.description,
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr-HT">
      <body className="min-h-screen antialiased">
        <PublicChrome>{children}</PublicChrome>
        <ClarityScript />
        <GoogleAnalyticsScript />
      </body>
    </html>
  );
}
