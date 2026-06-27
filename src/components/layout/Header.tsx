import Link from "next/link";
import { Sprout } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { siteConfig } from "@/config/site";
import { mainNavigation } from "@/data/navigation";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-emerald-800 bg-emerald-950 text-white shadow-sm">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold">
          <span className="rounded-full bg-orange-500 p-2 text-white"><Sprout size={20} /></span>
          <span>{siteConfig.name}</span>
          <span className="hidden text-xs font-medium text-emerald-200 sm:inline">Solutions agricoles</span>
        </Link>
        <nav className="flex flex-wrap items-center gap-3 text-sm font-medium text-emerald-50 sm:gap-5">
          {mainNavigation.map((item) => <Link key={item.href} href={item.href} className="transition hover:text-orange-200">{item.label}</Link>)}
          <Button href="/contact" variant="secondary" size="sm" className="hidden lg:inline-flex">Consultation</Button>
        </nav>
      </div>
    </header>
  );
}
