import Image from "next/image";
import Link from "next/link";

import { siteConfig } from "@/config/site";
import { mainNavigation } from "@/data/navigation";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-emerald-950/10 bg-[#F8F4EA] text-emerald-950 shadow-sm">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
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
        <nav className="flex flex-wrap items-center gap-3 text-sm font-semibold text-emerald-950/75 sm:gap-5">
          {mainNavigation.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-emerald-800">
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
