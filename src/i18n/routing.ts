import { defaultLocale, isValidLocale, type Locale } from "@/i18n/locales";

function splitPathSuffix(path: string) {
  const suffixIndex = path.search(/[?#]/);

  return suffixIndex === -1
    ? { pathname: path, suffix: "" }
    : { pathname: path.slice(0, suffixIndex), suffix: path.slice(suffixIndex) };
}

/**
 * Resolves a locale from a localized pathname. Non-localized and invalid paths
 * intentionally resolve to French while legacy routes remain in production.
 */
export function getLocale(pathname?: string | null): Locale {
  if (!pathname) return defaultLocale;

  const firstSegment = pathname.split(/[?#]/, 1)[0].split("/").filter(Boolean)[0];
  return isValidLocale(firstSegment) ? firstSegment : defaultLocale;
}

/**
 * Adds or replaces the locale prefix without changing query parameters or the
 * hash. This helper does not assert that the localized page has been published.
 */
export function getLocalizedPath(path: string, locale: Locale): string {
  const { pathname, suffix } = splitPathSuffix(path || "/");
  const segments = pathname.split("/").filter(Boolean);

  if (isValidLocale(segments[0])) segments.shift();

  const localizedPathname = `/${[locale, ...segments].join("/")}`;
  const trailingSlash = pathname.length > 1 && pathname.endsWith("/") ? "/" : "";

  return `${localizedPathname}${trailingSlash}${suffix}`;
}

const localizedPublicPaths = new Set(["/", "/services", "/contact", "/consultation", "/consultation/reserver", "/academy", "/actualites"]);

export function hasLocalizedPath(pathname: string): boolean {
  const withoutLocale = pathname.replace(/^\/(fr|en|es)(?=\/|$)/, "") || "/";
  const normalized = withoutLocale.replace(/\/$/, "") || "/";
  return localizedPublicPaths.has(normalized) || /^\/(services|articles|academy\/cours)\/.+/.test(normalized);
}
