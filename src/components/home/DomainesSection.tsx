import { Card } from "@/components/ui/Card";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";

const domains = [
  ["Aviculture", "Poulet de chair, pondeuses et écloserie avec une approche sanitaire et économique."],
  ["Élevage", "Cuniculture, apiculture, porciculture et conduite technique adaptée au terrain."],
  ["Production végétale", "Maraîchage, irrigation et planification culturale pour mieux produire."],
  ["Aquaculture", "Pisciculture, qualité de l’eau, densité et suivi des bassins."],
  ["Énergie rurale", "Biogaz et valorisation des déchets agricoles pour des fermes plus autonomes."],
  ["Accompagnement", "Diagnostic, installation, formation pratique et suivi des progrès."],
];

export function DomainesSection() {
  return (
    <Section className="bg-white">
      <SectionHeader eyebrow="Nos domaines d’intervention" title="Des solutions agricoles adaptées au terrain haïtien" description="Agri-tech intervient auprès des entrepreneurs, producteurs, associations et institutions qui veulent avancer avec méthode." />
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {domains.map(([title, description]) => <Card key={title}><h2 className="text-xl font-bold text-emerald-950">{title}</h2><p className="mt-3 text-sm leading-6 text-slate-600">{description}</p></Card>)}
      </div>
    </Section>
  );
}
