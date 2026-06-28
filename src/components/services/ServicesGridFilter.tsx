"use client";

import { useMemo, useState } from "react";

import { ServiceCard } from "@/components/services/ServiceCard";
import type { Service, ServiceFilterCategory } from "@/types/service";

type ServiceFilter = { label: "Tous" | ServiceFilterCategory; filterCategory?: ServiceFilterCategory };

const FILTERS: ServiceFilter[] = [
  { label: "Tous" },
  { label: "Élevage", filterCategory: "Élevage" },
  { label: "Production végétale", filterCategory: "Production végétale" },
  { label: "Technologie agricole", filterCategory: "Technologie agricole" },
  { label: "Accompagnement & formation", filterCategory: "Accompagnement & formation" },
];

export function ServicesGridFilter({ services }: { services: Service[] }) {
  const [activeFilter, setActiveFilter] = useState<ServiceFilter["label"]>("Tous");

  const filteredServices = useMemo(() => {
    const filter = FILTERS.find((item) => item.label === activeFilter);

    if (!filter?.filterCategory) {
      return services;
    }

    return services.filter((service) => service.filterCategory === filter.filterCategory);
  }, [activeFilter, services]);

  return (
    <div className="mt-10">
      <div className="flex max-w-full justify-start overflow-x-auto pb-2 sm:justify-center">
        <div className="inline-flex min-w-max rounded-full border border-emerald-950/10 bg-white/80 p-1 shadow-sm">
          {FILTERS.map((filter) => {
            const isActive = filter.label === activeFilter;

            return (
              <button
                key={filter.label}
                type="button"
                aria-pressed={isActive}
                onClick={() => setActiveFilter(filter.label)}
                className={`rounded-full px-5 py-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 ${
                  isActive ? "bg-emerald-950 text-white shadow-sm" : "text-emerald-950/70 hover:bg-emerald-50 hover:text-emerald-950"
                }`}
              >
                {filter.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredServices.map((service) => <ServiceCard key={service.slug} service={service} />)}
      </div>
    </div>
  );
}
