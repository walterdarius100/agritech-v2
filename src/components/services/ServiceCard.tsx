import Image from "next/image";

import type { Service } from "@/types/service";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export function ServiceCard({ service }: { service: Service }) {
  return (
    <Card className="flex h-full flex-col overflow-hidden rounded-xl border-emerald-100 p-0">
      <div className="relative h-48 w-full overflow-hidden bg-emerald-50">
        <Image src={service.image} alt={service.imageAlt} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover transition duration-500 group-hover:scale-105" />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <Badge tone="orange" className="w-fit">{service.category}</Badge>
        <h2 className="mt-4 text-xl font-bold text-emerald-950">{service.title}</h2>
        <p className="mt-3 flex-1 text-sm leading-6 text-slate-600">{service.shortDescription}</p>
        <Button href={`/services/${service.slug}`} variant="ghost" size="sm" className="mt-6 w-fit px-0 text-emerald-700 hover:bg-transparent hover:text-emerald-900" aria-label={`Voir le service ${service.title}`}>
          Voir ce service →
        </Button>
      </div>
    </Card>
  );
}
