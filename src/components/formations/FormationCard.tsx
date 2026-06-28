import Image from "next/image";

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
        </div>
        <div className="flex flex-1 flex-col p-6">
          <h2 className="text-xl font-bold leading-tight text-emerald-950">
            {formation.title}
          </h2>
          <p className="mt-2 text-xs font-bold uppercase tracking-[0.16em] text-orange-600">
            {formation.category}
          </p>
          <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">
            {formation.shortDescription}
          </p>
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
