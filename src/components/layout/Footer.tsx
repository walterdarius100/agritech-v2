import Link from "next/link";

import { siteConfig } from "@/config/site";
import { mainNavigation } from "@/data/navigation";

export function Footer() {
  return (
    <footer className="border-t border-emerald-100 bg-emerald-950 text-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <h2 className="text-xl font-bold">{siteConfig.name}</h2>
          <p className="mt-3 text-sm leading-6 text-emerald-50">{siteConfig.description}</p>
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-emerald-200">Navigation</h3>
          <ul className="mt-3 space-y-2 text-sm text-emerald-50">
            {mainNavigation.map((item) => <li key={item.href}><Link href={item.href} className="hover:text-orange-200">{item.label}</Link></li>)}
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-emerald-200">Contact</h3>
          <p className="mt-3 text-sm text-emerald-50">{siteConfig.contactEmail}</p>
          <p className="mt-2 text-sm text-emerald-50">Domaine officiel prévu : {siteConfig.domain}</p>
        </div>
      </div>
    </footer>
  );
}
