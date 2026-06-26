import Link from "next/link";
import { Menu, Sprout } from "lucide-react";

import { siteConfig } from "@/config/site";
import { mainNavigation } from "@/data/navigation";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-emerald-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-emerald-950" aria-label="Retour à l'accueil Agri-tech">
          <span className="rounded-full bg-emerald-100 p-2 text-emerald-700"><Sprout size={20} aria-hidden="true" /></span>
          {siteConfig.name}
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-700 md:flex" aria-label="Navigation principale">
          {mainNavigation.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-emerald-700">
              {item.label}
            </Link>
          ))}
        </nav>
        <details className="group relative md:hidden">
          <summary className="flex cursor-pointer list-none items-center rounded-full border border-emerald-100 p-2 text-emerald-900 marker:hidden">
            <span className="sr-only">Ouvrir le menu</span>
            <Menu size={22} aria-hidden="true" />
          </summary>
          <nav className="absolute right-0 mt-3 w-56 rounded-2xl border border-emerald-100 bg-white p-3 text-sm font-medium text-slate-700 shadow-xl" aria-label="Navigation mobile">
            {mainNavigation.map((item) => (
              <Link key={item.href} href={item.href} className="block rounded-xl px-3 py-2 transition hover:bg-emerald-50 hover:text-emerald-800">
                {item.label}
              </Link>
            ))}
          </nav>
        </details>
      </div>
    </header>
  );
}
