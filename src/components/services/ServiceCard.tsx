import type { Service } from "@/types/service";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export function ServiceCard({ service }: { service: Service }) {
  return (
    <Card className="flex h-full flex-col border-emerald-200 bg-gradient-to-b from-white to-emerald-50/60">
      <Badge tone="orange">{service.category}</Badge>
      <h2 className="mt-4 text-xl font-bold text-emerald-950">{service.title}</h2>
      <p className="mt-3 flex-1 text-sm leading-6 text-slate-600">{service.description}</p>
      <Button href="/contact" variant="outline" size="sm" className="mt-6 w-fit">Demander un accompagnement</Button>
    </Card>
  );
}
