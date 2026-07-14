import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createMetadata({
  title: "Réserver une consultation agricole",
  description:
    "Préparez votre demande de consultation agricole avec Agri-tech. Le formulaire de réservation sera disponible dans une prochaine étape du module Consultation.",
  path: "/consultation/reserver",
});

export default function ConsultationReservationPage() {
  return (
    <main className="bg-[#f8faf7] py-16 text-slate-900 sm:py-20 lg:py-24">
      <Container>
        <div className="mx-auto max-w-3xl rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-emerald-100 sm:p-12">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-700">
            Réservation Consultation
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-emerald-950 sm:text-5xl">
            Le formulaire de réservation arrive bientôt
          </h1>
          <p className="mt-5 text-lg leading-8 text-slate-600">
            Cette étape prépare le tunnel de réservation sans activer encore le
            paiement. En attendant, vous pouvez revenir à la page Consultation
            ou contacter Agri-tech pour présenter votre besoin.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button href="/consultation" size="lg">
              Voir la page Consultation
            </Button>
            <Link
              className="inline-flex items-center justify-center rounded-full border border-emerald-700 px-6 py-3.5 text-base font-semibold text-emerald-800 transition hover:bg-emerald-50"
              href="/contact"
            >
              Contacter Agri-tech
            </Link>
          </div>
        </div>
      </Container>
    </main>
  );
}
