import type { Locale } from "@/i18n/locales";
import type frMessages from "@/i18n/messages/fr.json";
import fr from "@/i18n/messages/fr.json";
import en from "@/i18n/messages/en.json";
import es from "@/i18n/messages/es.json";

export type Messages = typeof frMessages;

const messagesByLocale = { fr, en, es } satisfies Record<Locale, Messages>;

export function getMessagesSync(locale: Locale): Messages {
  return messagesByLocale[locale];
}

const messageLoaders: Record<Locale, () => Promise<Messages>> = {
  fr: async () => (await import("@/i18n/messages/fr.json")).default,
  en: async () => (await import("@/i18n/messages/en.json")).default,
  es: async () => (await import("@/i18n/messages/es.json")).default,
};

/** Loads only the dictionary requested by the server-rendered locale. */
export async function getMessages(locale: Locale): Promise<Messages> {
  return messageLoaders[locale]();
}
