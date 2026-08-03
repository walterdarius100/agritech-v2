import type { Metadata } from "next";

import { ConsultationReservationForm } from "@/components/consultation/ConsultationReservationForm";
import { Container } from "@/components/ui/Container";
import { createMetadata } from "@/lib/seo/metadata";
import { getMessagesSync, type Locale } from "@/i18n";

export const metadata: Metadata = createMetadata({
  title: "Réserver une consultation agricole",
  description:
    "Remplissez le formulaire de réservation de consultation agricole Agri-tech et préparez votre redirection vers le paiement de confirmation.",
  path: "/consultation/reserver",
});

export default function ConsultationReservationPage({ locale = "fr" }: { locale?: Locale }) {
  const messages = getMessagesSync(locale);
  return (
    <main className="bg-[#f8faf7] py-14 text-slate-900 sm:py-16 lg:py-20">
      <Container>
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <aside className="rounded-3xl bg-emerald-950 p-8 text-white shadow-xl lg:sticky lg:top-28">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-yellow-400">
              {messages.consultation.eyebrow}
            </p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
              {messages.consultation.title}
            </h1>
            <p className="mt-5 text-lg leading-8 text-white/80">
              {messages.consultation.description}
            </p>

            <div className="mt-8 rounded-2xl bg-white/10 p-5 ring-1 ring-white/15">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-yellow-300">
                {messages.consultation.feeLabel}
              </p>
              <p className="mt-3 text-2xl font-extrabold">2 500 HTG</p>
              <p className="mt-2 text-sm leading-6 text-white/75">
                {messages.consultation.feeDescription}
              </p>
            </div>
          </aside>

          <ConsultationReservationForm locale={locale} />
        </div>
      </Container>
    </main>
  );
}
