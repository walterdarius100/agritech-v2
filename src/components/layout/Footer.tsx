import Link from "next/link";

import { siteConfig } from "@/config/site";
import { mainNavigation } from "@/data/navigation";
import { services } from "@/data/services";

export function Footer() {
  return (
    <footer className="border-t border-emerald-900 bg-emerald-950 text-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <h2 className="text-xl font-bold">{siteConfig.name}</h2>
          <p className="mt-3 text-sm leading-6 text-emerald-50">{siteConfig.description}</p>
          <p className="mt-4 text-sm text-emerald-100">Email : <a className="font-semibold hover:text-orange-200" href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a></p>
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-emerald-200">Liens rapides</h3>
          <ul className="mt-3 space-y-2 text-sm text-emerald-50">
            {mainNavigation.map((item) => <li key={item.href}><Link href={item.href} className="hover:text-orange-200">{item.label}</Link></li>)}
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-emerald-200">Domaines principaux</h3>
          <ul className="mt-3 grid grid-cols-2 gap-2 text-sm text-emerald-50">
            {services.slice(0, 8).map((service) => <li key={service.slug}>{service.title}</li>)}
          </ul>
          <p className="mt-4 text-sm text-emerald-100">Domaine officiel prévu : {siteConfig.domain}</p>
        </div>
      </div>
    </footer>
  );
}
