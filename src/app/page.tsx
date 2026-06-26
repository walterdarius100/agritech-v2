import { Button } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { formations } from "@/data/formations";
import { services } from "@/data/services";

export default function HomePage() {
  return (
    <>
      <Section className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-green-800 text-white">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-orange-200">Plateforme V2</p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-6xl">Agri-tech V2</h1>
          <p className="mt-6 text-lg leading-8 text-emerald-50">Une base moderne pour les services agricoles, les formations, les articles, les leads et la future Agri-tech Academy.</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button href="/services" variant="secondary">Découvrir les services</Button>
            <Button href="/contact" className="bg-orange-500 hover:bg-orange-600">Contacter Agri-tech</Button>
          </div>
        </div>
      </Section>
      <Section>
        <SectionHeader title="Fondation évolutive" description="La V2 prépare une architecture claire pour passer progressivement du site public vers une plateforme éducative et opérationnelle." />
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {["Services agricoles", "Articles éducatifs", "Academy future"].map((item) => <div key={item} className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm"><h2 className="font-semibold text-emerald-950">{item}</h2><p className="mt-2 text-sm leading-6 text-slate-600">Structure prête à évoluer avec Supabase, SEO et analytics propres.</p></div>)}
        </div>
      </Section>
      <Section className="bg-white">
        <SectionHeader eyebrow="Aperçu" title="Domaines initiaux" description={`${services.length} services et ${formations.length} formations statiques servent de base avant l'intégration Supabase.`} />
      </Section>
    </>
  );
}
