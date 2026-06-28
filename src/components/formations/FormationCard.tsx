import Image from "next/image";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { Formation } from "@/types/formation";

export function FormationCard({ formation }: { formation: Formation }) {
  return (
    <article className="group flex h-full overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="flex w-full flex-col">
        <div className="relative h-52 overflow-hidden bg-emerald-50">
          <Image
            src={formation.image}
            alt={formation.imageAlt}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
          <div className="absolute left-4 top-4">
            <Badge tone="orange" className="bg-white/90 backdrop-blur">
              {formation.category}
            </Badge>
          </div>
        </div>
        <div className="flex flex-1 flex-col p-6">
          <h2 className="text-xl font-bold leading-tight text-emerald-950">
            {formation.title}
          </h2>
          <p className="mt-3 flex-1 text-sm leading-6 text-slate-600">
            {formation.shortDescription}
          </p>
          <dl className="mt-5 grid gap-2 text-xs text-slate-600">
            <div className="flex items-center justify-between gap-3 rounded-xl bg-emerald-50 px-3 py-2">
              <dt className="font-semibold text-emerald-900">Durée</dt>
              <dd>{formation.duration}</dd>
            </div>
            <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2">
              <dt className="font-semibold text-emerald-900">Format</dt>
              <dd className="text-right">{formation.format}</dd>
            </div>
            <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2">
              <dt className="font-semibold text-emerald-900">Niveau</dt>
              <dd className="text-right">{formation.level}</dd>
            </div>
          </dl>
          <Button
            href={`/formations/${formation.slug}`}
            variant="outline"
            size="sm"
            className="mt-6 w-fit"
          >
            Voir la formation →
          </Button>
        </div>
      </div>
    </article>
  );
}
