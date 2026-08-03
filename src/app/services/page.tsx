import type { Metadata } from "next";

import { ServicesGridFilter } from "@/components/services/ServicesGridFilter";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { services } from "@/data/services";
import { createMetadata } from "@/lib/seo/metadata";
import { getLocalizedPath, getMessagesSync, type Locale } from "@/i18n";

export const metadata: Metadata = createMetadata({
  title: "Services agricoles en Haïti",
  description: "Découvrez les services agricoles d’Agri-tech : aviculture, cuniculture, apiculture, pisciculture, production végétale, irrigation, formation et étude de projets agricoles.",
  path: "/services",
});

export default function ServicesPage({ locale = "fr" }: { locale?: Locale }) {
  const messages = getMessagesSync(locale);
  const contactHref = locale === "fr" ? "/contact" : getLocalizedPath("/contact", locale);
  return (
    <>
      <section className="bg-[#f8faf7]">
        <div className="w-full bg-emerald-950 py-14 sm:py-16 lg:py-20">
          <Container>
            <div className="max-w-3xl">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-yellow-400">{messages.services.eyebrow}</p>
              <h1 className="mt-5 text-4xl font-bold tracking-tight text-white sm:text-6xl">{messages.services.title}</h1>
              <p className="mt-6 text-lg leading-8 text-white/80">{messages.services.description}</p>
            </div>
          </Container>
        </div>
      </section>

      <Section className="bg-[#f8faf7] pt-0">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700">{messages.services.sectionEyebrow}</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-emerald-950 sm:text-4xl">{messages.services.sectionTitle}</h2>
          <p className="mt-4 text-base leading-7 text-slate-600">{messages.services.sectionDescription}</p>
        </div>

        <ServicesGridFilter services={services} locale={locale} />

        <div className="mt-12 rounded-2xl border border-emerald-100 bg-white p-8 text-center shadow-sm">
          <h2 className="text-2xl font-bold text-emerald-950">{messages.services.helpTitle}</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-600">{messages.services.helpDescription}</p>
          <Button href={contactHref} className="mt-6">{messages.services.helpAction}</Button>
        </div>
      </Section>
    </>
  );
}
