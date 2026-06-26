import type { Formation } from "@/types/formation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export function FormationCard({ formation }: { formation: Formation }) {
  return (
    <Card className="flex h-full flex-col">
      <div className="flex flex-wrap gap-2"><Badge>{formation.format}</Badge><Badge tone="slate">{formation.level}</Badge></div>
      <h2 className="mt-4 text-xl font-bold text-emerald-950">{formation.title}</h2>
      <p className="mt-3 flex-1 text-sm leading-6 text-slate-600">{formation.description}</p>
      <Button href="/contact" variant="outline" size="sm" className="mt-6 w-fit">Demander cette formation</Button>
    </Card>
  );
}
