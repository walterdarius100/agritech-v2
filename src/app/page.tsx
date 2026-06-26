import type { Metadata } from "next";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { articles } from "@/data/articles";
import { formations } from "@/data/formations";
import { services } from "@/data/services";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createMetadata({
  title: "Votre projet agricole, bien accompagné",
  description: "Services techniques, formations pratiques et contenus éducatifs pour accompagner les projets agricoles en Haïti.",
  path: "/",
});

const domains = ["Aviculture", "Élevage", "Aquaculture", "Maraîchage", "Irrigation", "Énergie rurale"];
const methods = ["Diagnostic du besoin", "Recommandations adaptées", "Suivi et amélioration", "Transmission pratique"];

export default function HomePage() {
  return (
    <>
      <Section className="overflow-hidden bg-[radial-gradient(circle_at_top_left,#f97316_0,#f9731600_24%),linear-gradient(135deg,#064e3b,#166534_52%,#f0fdf4)] text-white">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <Badge tone="orange" className="bg-orange-200 text-orange-950 ring-orange-300">Agri-tech Haïti</Badge>
            <h1 className="mt-5 max-w-4xl text-4xl font-bold tracking-tight sm:text-6xl">Votre projet agricole, bien accompagné</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-emerald-50">Agri-tech accompagne les porteurs de projets agricoles en Haïti avec des services techniques, des formations pratiques et des contenus éducatifs adaptés aux réalités du terrain.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button href="/contact" variant="secondary" size="lg">Demander une consultation</Button>
              <Button href="/services" variant="outline" size="lg" className="border-white text-white hover:bg-white/10">Voir nos services</Button>
            </div>
          </div>
          <div className="rounded-[2rem] border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-orange-100">Méthode terrain</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {methods.map((method) => <div key={method} className="rounded-2xl bg-white/15 p-4 text-sm font-semibold">{method}</div>)}
            </div>
          </div>
        </div>
      </Section>

      <Section>
        <SectionHeader eyebrow="Présentation" title="Une base V2 orientée services, formations et éducation agricole" description="Cette première version publique installe une structure claire, crédible et responsive avant les futures connexions Supabase." />
      </Section>

      <Section className="bg-white">
        <SectionHeader eyebrow="Domaines" title="Domaines d’intervention" description="Des accompagnements pensés pour les besoins concrets des producteurs, entrepreneurs et organisations agricoles." />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {domains.map((domain) => <Card key={domain}><Badge tone="green">Domaine</Badge><h2 className="mt-4 text-xl font-bold text-emerald-950">{domain}</h2><p className="mt-3 text-sm leading-6 text-slate-600">Approche technique, pratique et adaptée aux contraintes locales.</p></Card>)}
        </div>
      </Section>

      <Section>
        <SectionHeader eyebrow="Services" title="Services principaux" description="Une sélection des services agricoles prêts à être structurés plus finement dans les prochaines phases." />
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {services.filter((service) => service.featured).slice(0, 6).map((service) => <Card key={service.slug}><Badge tone="orange">{service.category}</Badge><h2 className="mt-4 text-xl font-bold text-emerald-950">{service.title}</h2><p className="mt-3 text-sm leading-6 text-slate-600">{service.description}</p></Card>)}
        </div>
      </Section>

      <Section className="bg-emerald-50">
        <SectionHeader eyebrow="Formations" title="Apprendre par la pratique" description="Des formations pensées pour clarifier les décisions techniques et économiques des projets agricoles." />
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {formations.filter((formation) => formation.featured).slice(0, 3).map((formation) => <Card key={formation.slug}><Badge tone="slate">{formation.format}</Badge><h2 className="mt-4 text-xl font-bold text-emerald-950">{formation.title}</h2><p className="mt-3 text-sm leading-6 text-slate-600">{formation.description}</p></Card>)}
        </div>
      </Section>

      <Section>
        <SectionHeader eyebrow="Actualités" title="Ressources récentes" description="Des contenus statiques temporaires préparent le futur blog connecté à Supabase." />
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {articles.map((article) => <Card key={article.slug}><Badge tone="orange">{article.category}</Badge><h2 className="mt-4 text-xl font-bold text-emerald-950">{article.title}</h2><p className="mt-3 text-sm leading-6 text-slate-600">{article.excerpt}</p><Button href={`/articles/${article.slug}`} variant="ghost" className="mt-5 px-0">Lire l’article</Button></Card>)}
        </div>
      </Section>

      <Section className="bg-emerald-950 text-white">
        <div className="mx-auto max-w-3xl text-center"><h2 className="text-3xl font-bold sm:text-4xl">Besoin d’un avis technique avant de lancer votre projet ?</h2><p className="mt-4 text-emerald-50">Contactez Agri-tech pour clarifier votre besoin, votre domaine et les prochaines étapes.</p><Button href="/contact" variant="secondary" size="lg" className="mt-8">Contacter Agri-tech</Button></div>
      </Section>
    </>
  );
}
