import Link from "next/link";
import { Sprout } from "lucide-react";

import { siteConfig } from "@/config/site";
import { legalNavigation, mainNavigation } from "@/data/navigation";
import { services } from "@/data/services";

export function Footer() {
  return (
    <footer className="border-t border-emerald-900 bg-emerald-950 text-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div>
          <div className="flex items-center gap-2 text-2xl font-bold"><span className="rounded-full bg-orange-500 p-2"><Sprout size={20} /></span>{siteConfig.name}</div>
          <p className="mt-4 text-sm leading-6 text-emerald-50">Nous accompagnons les projets agricoles en Haïti avec une approche moderne, pratique et orientée résultats.</p>
          <a className="mt-4 block text-sm font-semibold text-orange-200" href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>
          <p className="mt-2 text-sm text-emerald-100">Haïti</p>
        </div>
        <FooterList title="Liens rapides" items={mainNavigation} />
        <FooterList title="Liens légaux" items={legalNavigation} />
        <div><h3 className="text-sm font-semibold uppercase tracking-wider text-emerald-200">Domaines principaux</h3><ul className="mt-3 space-y-2 text-sm text-emerald-50">{services.slice(0, 7).map((service) => <li key={service.slug}>{service.title}</li>)}</ul></div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-sm text-emerald-100">© 2026 Agri-tech — Tous droits réservés</div>
    </footer>
  );
}

function FooterList({ title, items }: { title: string; items: readonly { label: string; href: string }[] }) {
  return <div><h3 className="text-sm font-semibold uppercase tracking-wider text-emerald-200">{title}</h3><ul className="mt-3 space-y-2 text-sm text-emerald-50">{items.map((item) => <li key={item.href}><Link href={item.href} className="hover:text-orange-200">{item.label}</Link></li>)}</ul></div>;
}
