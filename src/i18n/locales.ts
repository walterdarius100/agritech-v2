export const locales = ["fr", "en", "es"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "fr";

export const localeConfig = {
  fr: { label: "Français", flag: "🇫🇷", code: "FR", htmlLang: "fr-HT" },
  en: { label: "English", flag: "🇺🇸", code: "EN", htmlLang: "en" },
  es: { label: "Español", flag: "🇪🇸", code: "ES", htmlLang: "es" },
} as const satisfies Record<
  Locale,
  { label: string; flag: string; code: string; htmlLang: string }
>;

export function isValidLocale(value: unknown): value is Locale {
  return typeof value === "string" && locales.some((locale) => locale === value);
}
