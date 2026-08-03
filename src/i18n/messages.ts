import type { Locale } from "@/i18n/locales";
import type frMessages from "@/i18n/messages/fr.json";

export type Messages = typeof frMessages;

const messageLoaders: Record<Locale, () => Promise<Messages>> = {
  fr: async () => (await import("@/i18n/messages/fr.json")).default,
  en: async () => (await import("@/i18n/messages/en.json")).default,
  es: async () => (await import("@/i18n/messages/es.json")).default,
};

/** Loads only the dictionary requested by the server-rendered locale. */
export async function getMessages(locale: Locale): Promise<Messages> {
  return messageLoaders[locale]();
}
