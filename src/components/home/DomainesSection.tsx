import Image from "next/image";
import Link from "next/link";
import { Leaf, Sprout, Tractor, UsersRound } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";
import { homeDomains } from "@/data/home-domains";
import type { Locale } from "@/i18n";
import { getLocalizedPath } from "@/i18n";
import { publicContent } from "@/i18n/public-content";

const pillarIcons = [Leaf, Sprout, Tractor, UsersRound];

export function DomainesSection({ locale = "fr" }: { locale?: Locale }) {
  const content = publicContent[locale];
  const interventionPillars = content.pillars.map(([title, description]) => ({
    title,
    description,
  }));
  const domains = homeDomains.map((domain, index) => ({
    ...domain,
    title: content.domainCards[index][0],
    category: content.domainCards[index][1],
    description: content.domainCards[index][2],
  }));
  return (
    <Section className="bg-[#f8faf7]">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-emerald-700">
          {content.domains.eyebrow}
        </p>
        <h2 className="mt-4 text-3xl font-black tracking-tight text-emerald-950 sm:text-4xl lg:text-5xl">
          {content.domains.title}
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600">
          {content.domains.description}
        </p>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {interventionPillars.map((pillar, index) => {
          const Icon = pillarIcons[index];

          return (
            <article
              key={pillar.title}
              className="flex gap-4 rounded-xl border border-emerald-100 bg-white/90 p-5 shadow-sm shadow-emerald-950/5 transition hover:border-emerald-200 hover:bg-emerald-50/60"
            >
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200">
                <Icon aria-hidden="true" className="size-5" />
              </div>
              <div>
                <h3 className="text-lg font-black tracking-tight text-emerald-950">
                  {pillar.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {pillar.description}
                </p>
              </div>
            </article>
          );
        })}
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {domains.map((domain) => (
          <article
            key={domain.title}
            className="group flex h-full overflow-hidden rounded-xl border border-emerald-100 bg-white shadow-sm shadow-emerald-950/5 transition duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-950/10"
          >
            <div className="flex w-full flex-col">
              <div className="relative aspect-[4/3] overflow-hidden rounded-t-xl bg-emerald-100">
                <Image
                  src={domain.image}
                  alt={domain.imageAlt}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-1 flex-col p-6">
                <Badge tone="green" className="w-fit">
                  {domain.category}
                </Badge>
                <h3 className="mt-4 text-2xl font-black tracking-tight text-emerald-950">
                  {domain.title}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-6 text-slate-600">
                  {domain.description}
                </p>
                <Link
                  href={
                    locale === "fr"
                      ? domain.href
                      : getLocalizedPath(domain.href, locale)
                  }
                  className="mt-6 inline-flex min-h-10 w-fit items-center text-sm font-bold text-emerald-700 transition hover:text-emerald-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2"
                >
                  {content.domains.discover}{" "}
                  <span
                    aria-hidden="true"
                    className="ml-1 transition group-hover:translate-x-1"
                  >
                    →
                  </span>
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-10 flex justify-center">
        <Button
          href={
            locale === "fr"
              ? "/services"
              : getLocalizedPath("/services", locale)
          }
          size="lg"
          className="rounded-xl px-7"
        >
          {content.domains.all}{" "}
          <span aria-hidden="true" className="ml-2">
            →
          </span>
        </Button>
      </div>
    </Section>
  );
}
