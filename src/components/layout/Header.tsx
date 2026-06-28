"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { siteConfig } from "@/config/site";
import { mainNavigation } from "@/data/navigation";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const mobileMenuId = "mobile-navigation";

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-emerald-950/10 bg-emerald-50 text-emerald-950 shadow-sm">
      <div className="mx-auto flex max-w-6xl flex-row items-center justify-between gap-4 px-4 py-4 sm:px-6 md:flex-col md:items-start lg:flex-row lg:items-center lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#0E3B2E] shadow-sm">
            <Image
              src="/images/brand/Untitled-1.png"
              alt="Logo Agri-tech"
              width={34}
              height={34}
              className="h-8 w-8 object-contain"
              priority
            />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-lg font-extrabold tracking-tight text-emerald-950 sm:text-xl">{siteConfig.name}</span>
            <span className="text-sm font-medium text-emerald-950/65 sm:text-base">Solutions agricoles</span>
          </span>
        </Link>
        <nav className="hidden flex-wrap items-center gap-3 text-sm font-semibold text-emerald-950/75 sm:gap-5 md:flex">
          {mainNavigation.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-emerald-800">
              {item.label}
            </Link>
          ))}
        </nav>
        <button
          type="button"
          className="group flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-emerald-950/15 text-emerald-950 transition hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:ring-offset-2 focus:ring-offset-emerald-50 md:hidden"
          aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={isMenuOpen}
          aria-controls={mobileMenuId}
          onClick={() => setIsMenuOpen((current) => !current)}
        >
          <span className="relative h-5 w-6" aria-hidden="true">
            <span className={`absolute left-0 top-0 h-0.5 w-6 rounded-full bg-current transition duration-300 ${isMenuOpen ? "translate-y-2 rotate-45" : ""}`} />
            <span className={`absolute left-0 top-2 h-0.5 w-6 rounded-full bg-current transition duration-300 ${isMenuOpen ? "opacity-0" : "opacity-100"}`} />
            <span className={`absolute left-0 top-4 h-0.5 w-6 rounded-full bg-current transition duration-300 ${isMenuOpen ? "-translate-y-2 -rotate-45" : ""}`} />
          </span>
        </button>
      </div>
      <nav
        id={mobileMenuId}
        className={`overflow-hidden border-t border-emerald-950/10 bg-emerald-50 transition-all duration-300 md:hidden ${isMenuOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"}`}
        aria-label="Navigation mobile"
      >
        <div className="mx-auto flex max-w-6xl flex-col px-4 py-3 text-sm font-semibold text-emerald-950/80 sm:px-6">
          {mainNavigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-2 py-3 transition hover:bg-emerald-100 hover:text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-800"
              onClick={() => setIsMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
