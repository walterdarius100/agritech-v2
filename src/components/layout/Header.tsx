import Link from "next/link";
import { Sprout } from "lucide-react";

import { siteConfig } from "@/config/site";
import { mainNavigation } from "@/data/navigation";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-emerald-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-emerald-950">
          <span className="rounded-full bg-emerald-100 p-2 text-emerald-700"><Sprout size={20} /></span>
          {siteConfig.name}
        </Link>
        <nav className="flex flex-wrap gap-3 text-sm font-medium text-slate-700 sm:gap-5">
          {mainNavigation.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-emerald-700">
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
