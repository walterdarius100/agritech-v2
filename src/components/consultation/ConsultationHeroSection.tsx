import { ArrowRight, MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import type { Locale } from "@/i18n";
import { getLocalizedPath } from "@/i18n";
import { publicContent } from "@/i18n/public-content";

export function ConsultationHeroSection({
  locale = "fr",
}: {
  locale?: Locale;
}) {
  const content = publicContent[locale].consultation;
  const reservationHref =
    locale === "fr"
      ? "/consultation/reserver"
      : getLocalizedPath("/consultation/reserver", locale);
  return (
    <section className="overflow-hidden bg-emerald-950 text-white">
      <Container className="relative py-16 sm:py-20 lg:py-24">
        <div className="absolute -right-24 top-10 hidden h-72 w-72 rounded-full bg-yellow-400/10 blur-3xl lg:block" />
        <div className="absolute -bottom-28 left-1/3 hidden h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl lg:block" />

        <div className="relative grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-yellow-400">
              {content.eyebrow}
            </p>
            <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              {content.title}
            </h1>
            <p className="mt-6 text-lg leading-8 text-white/80">
              {content.description}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button
                href={reservationHref}
                size="lg"
                className="bg-yellow-400 text-emerald-950 hover:bg-yellow-300 focus-visible:ring-yellow-400"
              >
                {content.book}
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Button>
              <Button
                href={reservationHref}
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 focus-visible:ring-white"
              >
                {content.start}
              </Button>
            </div>
          </div>

          <aside className="rounded-3xl bg-white p-6 text-slate-900 shadow-2xl shadow-emerald-950/30 ring-1 ring-white/20 sm:p-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <MessageCircle className="h-7 w-7" aria-hidden="true" />
            </div>
            <h2 className="mt-6 text-2xl font-bold text-emerald-950">
              {content.cardTitle}
            </h2>
            <p className="mt-3 leading-7 text-slate-600">{content.cardText}</p>
            <div className="mt-6 rounded-2xl bg-emerald-50 p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
                {content.price}
              </p>
              <p className="mt-2 text-3xl font-extrabold text-emerald-950">
                2 500 HTG
              </p>
              <p className="mt-1 text-sm text-slate-600">{content.duration}</p>
            </div>
          </aside>
        </div>
      </Container>
    </section>
  );
}
