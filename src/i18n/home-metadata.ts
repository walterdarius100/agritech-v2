import type { Metadata } from "next";

import { getMessages } from "@/i18n/messages";
import type { Locale } from "@/i18n/locales";
import { createMetadata } from "@/lib/seo/metadata";

export async function createLocalizedHomeMetadata(locale: Locale): Promise<Metadata> {
  const messages = await getMessages(locale);
  const metadata = createMetadata({
    title: messages.seo.siteTitle,
    description: messages.seo.siteDescription,
    path: `/${locale}`,
  });

  // EN/ES currently provide a safe navigation destination, while the home
  // content migration is pending. Do not index those transitional pages.
  return locale === "fr" ? metadata : { ...metadata, robots: { index: false, follow: true } };
}
