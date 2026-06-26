import type { Metadata } from "next";
import { CheckCircle2, Leaf, ShieldCheck, TrendingUp } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { formations } from "@/data/formations";
import { services } from "@/data/services";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createMetadata({
  title: "Votre projet agricole, bien accompagné",
  description: "Services techniques, formations pratiques et contenus éducatifs agricoles pour les porteurs de projets en Haïti.",
  path: "/",
});

const methods = [
  "Diagnostic clair du besoin et du contexte terrain",
  "Recommandations techniques adaptées aux moyens disponibles",
  "Suivi pédagogique pour renforcer l'autonomie du producteur",
];

const news = [
  "Préparer un bâtiment avicole fonctionnel",
  "Comprendre les bases de l'irrigation maraîchère",
  "Pourquoi planifier avant d'investir en élevage",
];

export default function HomePage() {
  const featuredServices = services.filter((service) => service.featured).slice(0, 6);
  const featuredFormations = formations.filter((formation) => formation.featured).slice(0, 3);

  return (
    <>
      <Section className="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-900 to-green-800 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(251,146,60,0.24),transparent_35%)]" />
        <div className="relative grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <Badge variant="orange">Agri-tech V2 · Haïti</Badge>
            <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-6xl">Votre projet agricole, bien accompagné</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-emerald-50">Agri-tech accompagne les porteurs de projets agricoles en Haïti avec des services techniques, des formations pratiques et des contenus éducatifs adaptés aux réalités du terrain.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button href="/contact" variant="secondary" size="lg">Demander une consultation</Button>
              <Button href="/services" variant="outline" size="lg">Voir nos services</Button>
            </div>
          </div>
          <Card as="div" className="border-white/10 bg-white/10 text-white backdrop-blur hover:translate-y-0">
            <Leaf className="text-orange-200" size={42} aria-hidden="true" />
            <h2 className="mt-5 text-2xl font-bold">Une base publique claire avant Supabase</h2>
            <p className="mt-3 leading-7 text-emerald-50">Cette V2 pose le socle public : pages, composants, SEO minimal, données temporaires et structure prête pour les articles et les leads.</p>
          </Card>
        </div>
      </Section>

      <Section>
        <SectionHeader eyebrow="Présentation" title="Un accompagnement agricole sérieux et pratique" description="Agri-tech aide à clarifier, structurer et améliorer les projets agricoles avec une approche accessible, progressive et orientée résultats." />
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {methods.map((item) => <Card key={item}><CheckCircle2 className="text-emerald-700" /><p className="mt-4 font-semibold text-emerald-950">{item}</p></Card>)}
        </div>
      </Section>

      <Section className="bg-white">
        <SectionHeader eyebrow="Domaines" title="Domaines d'intervention" description="Une couverture initiale des principaux besoins d'élevage, de production végétale, d'infrastructure et d'énergie agricole." />
        <div className="mt-10 flex flex-wrap justify-center gap-3">{services.map((service) => <Badge key={service.slug}>{service.title}</Badge>)}</div>
      </Section>

      <Section>
        <SectionHeader eyebrow="Services" title="Services principaux" description="Des prestations statiques pour démarrer, prêtes à être enrichies par une base Supabase plus tard." />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{featuredServices.map((service) => <Card key={service.slug}><Badge variant="orange">{service.category}</Badge><h3 className="mt-4 text-xl font-bold text-emerald-950">{service.title}</h3><p className="mt-3 text-sm leading-6 text-slate-600">{service.description}</p></Card>)}</div>
      </Section>

      <Section className="bg-emerald-50">
        <SectionHeader eyebrow="Formations" title="Formations pratiques" description="Des parcours courts pour renforcer les compétences techniques avant la future Agri-tech Academy." />
        <div className="mt-10 grid gap-4 md:grid-cols-3">{featuredFormations.map((formation) => <Card key={formation.slug}><Badge>{formation.format}</Badge><h3 className="mt-4 text-xl font-bold text-emerald-950">{formation.title}</h3><p className="mt-3 text-sm leading-6 text-slate-600">{formation.description}</p></Card>)}</div>
      </Section>

      <Section>
        <SectionHeader eyebrow="Actualités" title="Articles récents" description="Aperçu statique temporaire en attendant la connexion Supabase des contenus éditoriaux." />
        <div className="mt-10 grid gap-4 md:grid-cols-3">{news.map((title) => <Card key={title}><Badge variant="neutral">Bientôt</Badge><h3 className="mt-4 text-lg font-bold text-emerald-950">{title}</h3><p className="mt-3 text-sm leading-6 text-slate-600">Article préparé pour la prochaine phase éditoriale.</p></Card>)}</div>
      </Section>

      <Section className="bg-emerald-950 text-white">
        <div className="grid items-center gap-8 md:grid-cols-[1fr_auto]">
          <div><SectionHeader align="left" eyebrow="Contact" title="Vous préparez un projet agricole ?" description="Décrivez votre besoin, votre domaine et votre contexte. Agri-tech pourra ensuite structurer la prise de contact et les leads." /></div>
          <Button href="/contact" variant="secondary" size="lg">Demander une consultation</Button>
        </div>
      </Section>

      <Section>
        <div className="grid gap-4 md:grid-cols-2"><Card><ShieldCheck className="text-emerald-700" /><h2 className="mt-4 text-2xl font-bold text-emerald-950">Méthode responsable</h2><p className="mt-3 leading-7 text-slate-600">Une communication sobre, lisible et orientée crédibilité pour accompagner les décisions agricoles.</p></Card><Card><TrendingUp className="text-orange-600" /><h2 className="mt-4 text-2xl font-bold text-emerald-950">Architecture évolutive</h2><p className="mt-3 leading-7 text-slate-600">La structure prépare les futures étapes : articles dynamiques, sauvegarde des leads, analytics et modules avancés.</p></Card></div>
      </Section>
    </>
  );
}
