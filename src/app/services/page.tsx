import type { Metadata } from "next";

import { PageHero } from "@/components/common/PageHero";
import { ServiceCard } from "@/components/services/ServiceCard";
import { Button } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";
import { services } from "@/data/services";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createMetadata({
  title: "Services agricoles en Haïti",
  description: "Découvrez les services agricoles d’Agri-tech : aviculture, cuniculture, apiculture, pisciculture, production végétale, irrigation, formation et étude de projets agricoles.",
  path: "/services",
});

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="SERVICES AGRI-TECH"
        title="Des services agricoles pour concevoir, lancer et suivre vos projets."
        description="Agri-tech accompagne les porteurs de projets, producteurs, entreprises et organisations dans la mise en place de solutions agricoles adaptées au terrain haïtien."
      />
      <Section className="bg-[#f8faf7]">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700">Nos accompagnements</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-emerald-950 sm:text-4xl">Choisissez le service adapté à votre projet agricole</h2>
          <p className="mt-4 text-base leading-7 text-slate-600">Chaque accompagnement combine analyse du besoin, conseils techniques et recommandations pratiques pour avancer avec méthode avant, pendant ou après le lancement.</p>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{services.map((service) => <ServiceCard key={service.slug} service={service} />)}</div>
        <div className="mt-12 rounded-2xl border border-emerald-100 bg-white p-8 text-center shadow-sm">
          <h2 className="text-2xl font-bold text-emerald-950">Vous ne savez pas par où commencer ?</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-600">Contactez Agri-tech pour clarifier votre besoin et identifier le service le plus pertinent pour votre projet.</p>
          <Button href="/contact" className="mt-6">Parler de mon projet</Button>
        </div>
      </Section>
    </>
  );
}
