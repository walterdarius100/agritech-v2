import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/ui/Container";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createMetadata({
  title: "Paiement consultation",
  description:
    "Étape de paiement de la demande de consultation agricole Agri-tech.",
  path: "/consultation/checkout",
});

export default async function ConsultationCheckoutPage({
  params,
}: {
  params: Promise<{ requestId: string }>;
}) {
  const { requestId } = await params;

  return (
    <main className="bg-[#f8faf7] py-16 text-slate-900 sm:py-20 lg:py-24">
      <Container>
        <div className="mx-auto max-w-3xl rounded-3xl bg-white p-8 shadow-sm ring-1 ring-emerald-100 sm:p-12">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-700">
            Checkout Consultation
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-emerald-950 sm:text-5xl">
            Demande créée avec succès
          </h1>
          <p className="mt-5 text-lg leading-8 text-slate-600">
            Votre demande de consultation a été enregistrée avec l’identifiant
            technique suivant. L’intégration du paiement sera ajoutée dans une
            prochaine étape.
          </p>
          <div className="mt-6 rounded-2xl bg-emerald-50 p-5 font-mono text-sm text-emerald-950">
            {requestId}
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              className="inline-flex items-center justify-center rounded-full bg-emerald-700 px-6 py-3.5 text-base font-bold text-white transition hover:bg-emerald-800"
              href="/consultation"
            >
              Retour à la consultation
            </Link>
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
