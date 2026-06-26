import { Button } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";

const highlights = ["Diagnostic", "Plan technique", "Installation", "Formation", "Suivi terrain"];

export function HomeHero() {
  return (
    <Section className="relative overflow-hidden bg-emerald-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(249,115,22,0.38),transparent_28%),linear-gradient(115deg,rgba(2,44,34,0.98),rgba(6,78,59,0.94)_55%,rgba(22,101,52,0.88))]" />
      <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(30deg,rgba(255,255,255,.14)_12%,transparent_12.5%,transparent_87%,rgba(255,255,255,.14)_87.5%,rgba(255,255,255,.14)),linear-gradient(150deg,rgba(255,255,255,.14)_12%,transparent_12.5%,transparent_87%,rgba(255,255,255,.14)_87.5%,rgba(255,255,255,.14))] [background-size:80px_140px]" />
      <div className="relative grid items-center gap-10 py-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-orange-200">Solutions agricoles modernes en Haïti</p>
          <h1 className="mt-5 max-w-4xl text-4xl font-bold tracking-tight sm:text-6xl">Votre projet agricole, bien accompagné</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-emerald-50">Agri-tech accompagne les porteurs de projets agricoles en Haïti avec des services techniques, des formations pratiques et des contenus éducatifs adaptés aux réalités du terrain.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button href="/contact" variant="secondary" size="lg">Demander une consultation</Button>
            <Button href="/services" variant="outline" size="lg" className="border-white/70 text-white hover:bg-white/10">Voir nos services</Button>
          </div>
        </div>
        <div className="rounded-[2rem] border border-white/15 bg-white/10 p-6 shadow-2xl backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-orange-100">Méthode terrain</p>
          <h2 className="mt-4 text-2xl font-bold">De l’idée au suivi productif</h2>
          <div className="mt-6 grid gap-3">
            {highlights.map((item, index) => <div key={item} className="flex items-center gap-4 rounded-2xl bg-white/12 p-4"><span className="text-orange-200">0{index + 1}</span><span className="font-semibold">{item}</span></div>)}
          </div>
        </div>
      </div>
    </Section>
  );
}
