import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/ui/Container";
import { getConsultationCheckoutRequest } from "@/lib/consultation/checkout";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createMetadata({
  title: "Confirmation consultation",
  description: "Confirmation de la demande de consultation agricole Agri-tech.",
  path: "/consultation/confirmation",
});

function formatAmount(amount: number, currency: string) {
  return `${Number(amount).toLocaleString("fr-FR")} ${currency}`;
}

export default async function ConsultationConfirmationPage({
  params,
}: {
  params: Promise<{ requestId: string }>;
}) {
  const { requestId } = await params;
  const request = await getConsultationCheckoutRequest(requestId);

  if (!request) {
    return (
      <main className="bg-[#f8faf7] py-16 text-slate-900 sm:py-20 lg:py-24">
        <Container>
          <div className="mx-auto max-w-2xl rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-emerald-100 sm:p-12">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-red-700">
              Demande introuvable
            </p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-emerald-950">
              Demande introuvable
            </h1>
            <p className="mt-4 leading-7 text-slate-600">
              Cette demande de consultation n’existe pas ou n’est plus
              disponible.
            </p>
            <Link
              className="mt-8 inline-flex rounded-full bg-emerald-700 px-6 py-3 font-bold text-white transition hover:bg-emerald-800"
              href="/consultation/reserver"
            >
              Refaire une demande
            </Link>
          </div>
        </Container>
      </main>
    );
  }

  return (
    <main className="bg-[#f8faf7] py-16 text-slate-900 sm:py-20 lg:py-24">
      <Container>
        <div className="mx-auto max-w-3xl rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-emerald-100 sm:p-12">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-700">
            Paiement confirmé
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-emerald-950 sm:text-5xl">
            Votre demande est confirmée
          </h1>
          <p className="mt-5 text-lg leading-8 text-slate-600">
            Agri-tech a reçu votre demande de consultation. L’équipe vous
            contactera pour organiser la suite selon les informations fournies.
          </p>

          <dl className="mt-8 grid gap-4 text-left sm:grid-cols-2">
            <div className="rounded-2xl bg-emerald-50 p-4">
              <dt className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
                Code demande
              </dt>
              <dd className="mt-2 font-semibold text-emerald-950">
                {request.request_code}
              </dd>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-4">
              <dt className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
                Montant
              </dt>
              <dd className="mt-2 font-semibold text-emerald-950">
                {formatAmount(request.amount, request.currency)}
              </dd>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <dt className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                Statut demande
              </dt>
              <dd className="mt-2 font-semibold text-slate-950">
                {request.request_status}
              </dd>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <dt className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                Statut paiement
              </dt>
              <dd className="mt-2 font-semibold text-slate-950">
                {request.payment_status}
              </dd>
            </div>
          </dl>

          <Link
            className="mt-8 inline-flex rounded-full bg-emerald-700 px-6 py-3 font-bold text-white transition hover:bg-emerald-800"
            href="/consultation"
          >
            Retour à la page Consultation
          </Link>
        </div>
      </Container>
    </main>
  );
}
