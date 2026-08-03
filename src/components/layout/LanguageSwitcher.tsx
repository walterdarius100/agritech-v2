"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import { getLocale, getLocalizedPath, getMessagesSync, hasLocalizedPath, localeConfig, locales, type Locale } from "@/i18n";

type LanguageSwitcherProps = {
  mobile?: boolean;
};

function getTargetPath(pathname: string, locale: Locale) {
  const pathWithoutLocale = pathname.replace(/^\/(fr|en|es)(?=\/|$)/, "") || "/";

  // Only localized home pages are published in this incremental PR. Until a
  // page family is migrated, changing language intentionally falls back home.
  return getLocalizedPath(hasLocalizedPath(pathWithoutLocale) ? pathname : "/", locale);
}

export function LanguageSwitcher({ mobile = false }: LanguageSwitcherProps) {
  const pathname = usePathname();
  const router = useRouter();
  const menuId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const activeLocale = getLocale(pathname);
  const activeLanguage = localeConfig[activeLocale];
  const messages = getMessagesSync(activeLocale);

  useEffect(() => setIsOpen(false), [pathname]);

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  function selectLocale(locale: Locale) {
    setIsOpen(false);
    document.cookie = `NEXT_LOCALE=${locale}; Path=/; Max-Age=31536000; SameSite=Lax`;
    router.push(getTargetPath(pathname, locale));
  }

  return (
    <div className={`relative ${mobile ? "w-full" : "shrink-0"}`} ref={containerRef}>
      <button
        type="button"
        className={`inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-900/15 bg-white/55 px-3 py-2 text-sm font-bold text-emerald-950 shadow-sm transition hover:border-emerald-800/30 hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-50 ${mobile ? "w-full justify-between" : ""}`}
        aria-label={messages.navigation.changeLanguage}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-controls={menuId}
        onClick={() => setIsOpen((current) => !current)}
      >
        <span className="flex items-center gap-2">
          <span className="text-base leading-none" aria-hidden="true">{activeLanguage.flag}</span>
          <span>{activeLanguage.code}</span>
        </span>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      {isOpen ? (
        <div
          id={menuId}
          role="menu"
          aria-label={messages.navigation.availableLanguages}
          className={`${mobile ? "mt-2 w-full" : "absolute right-0 top-full z-50 mt-2 w-48"} overflow-hidden rounded-xl border border-emerald-900/10 bg-white p-1.5 shadow-xl ring-1 ring-black/5`}
        >
          {locales.map((locale) => {
            const language = localeConfig[locale];
            const isActive = locale === activeLocale;

            return (
              <button
                key={locale}
                type="button"
                role="menuitemradio"
                aria-checked={isActive}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 ${isActive ? "bg-emerald-50 font-bold text-emerald-950" : "font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-950"}`}
                onClick={() => selectLocale(locale)}
              >
                <span className="text-base leading-none" aria-hidden="true">{language.flag}</span>
                <span>{language.label}</span>
                {isActive ? <span className="sr-only">({messages.navigation.activeLanguage})</span> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
