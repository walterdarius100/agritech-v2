import type { Locale } from "@/i18n";

export type ContentTranslations = Partial<
  Record<Locale, Record<string, unknown>>
>;

function asNonEmptyString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized ? normalized : null;
}

/**
 * Reads an editorial field from the active locale, then French, then the
 * original database column. Only strings are returned, so malformed JSONB can
 * never leak `null`, `undefined`, or `[object Object]` into the public UI.
 */
export function getLocalizedField({
  locale,
  field,
  translations,
  fallback,
}: {
  locale: Locale;
  field: string;
  translations?: ContentTranslations | null;
  fallback?: unknown;
}): string {
  return (
    asNonEmptyString(translations?.[locale]?.[field]) ??
    asNonEmptyString(translations?.fr?.[field]) ??
    asNonEmptyString(fallback) ??
    ""
  );
}

export function getLocalizedSlug({
  locale,
  translations,
  fallback,
}: {
  locale: Locale;
  translations?: ContentTranslations | null;
  fallback: string;
}): string {
  return getLocalizedField({ locale, field: "slug", translations, fallback });
}
