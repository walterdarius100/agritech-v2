import type { Metadata } from "next";

import { getMessagesSync } from "@/i18n/messages";
import type { Locale } from "@/i18n/locales";
import { createMetadata } from "@/lib/seo/metadata";

type PublicPage = "services" | "contact" | "consultation" | "academy";

export function createLocalizedPageMetadata(locale: Locale, page: PublicPage): Metadata {
  const messages = getMessagesSync(locale);
  const content = {
    services: { title: messages.services.title, description: messages.services.description, path: "services" },
    contact: { title: messages.contact.title, description: messages.contact.description, path: "contact" },
    consultation: { title: messages.consultation.title, description: messages.consultation.description, path: "consultation/reserver" },
    academy: { title: messages.academy.heroTitle, description: messages.academy.heroDescription, path: "academy" },
  }[page];
  const metadata = createMetadata({ ...content, path: `/${locale}/${content.path}` });

  return locale === "fr" ? metadata : { ...metadata, robots: { index: false, follow: true } };
}
