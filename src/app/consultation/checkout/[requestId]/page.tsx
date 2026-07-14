import type { Metadata } from "next";
import Link from "next/link";

import { ConsultationMockPaymentForm } from "@/components/consultation/ConsultationMockPaymentForm";
import { Container } from "@/components/ui/Container";
import { getConsultationCheckoutRequest } from "@/lib/consultation/checkout";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createMetadata({
  title: "Paiement consultation",
  description:
    "Étape de paiement de la demande de consultation agricole Agri-tech.",
  path: "/consultation/checkout",
});

function formatAmount(amount: number, currency: string) {
  return `${Number(amount).toLocaleString("fr-FR")} ${currency}`;
}

export default async function ConsultationCheckoutPage({
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

  const isPaid =
    request.payment_status === "paid" || Boolean(request.paid_payment);

  return (
    <main className="bg-[#f8faf7] py-14 text-slate-900 sm:py-16 lg:py-20">
      <Container>
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-emerald-100 sm:p-8">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-700">
              Checkout Consultation
            </p>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-emerald-950 sm:text-4xl">
              Résumé de votre demande
            </h1>

            <dl className="mt-8 grid gap-4 sm:grid-cols-2">
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
                  Statut paiement
                </dt>
                <dd className="mt-2 font-semibold text-emerald-950">
                  {request.payment_status}
                </dd>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <dt className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                  Client
                </dt>
                <dd className="mt-2 font-semibold text-slate-950">
                  {request.full_name}
                </dd>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <dt className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                  Type de consultation
                </dt>
                <dd className="mt-2 font-semibold text-slate-950">
                  {request.consultation_type}
                </dd>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 sm:col-span-2">
                <dt className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                  Package
                </dt>
                <dd className="mt-2 font-semibold text-slate-950">
                  {request.consultation_package}
                </dd>
              </div>
              <div className="rounded-2xl bg-slate-900 p-4 text-white sm:col-span-2">
                <dt className="text-xs font-bold uppercase tracking-[0.16em] text-yellow-300">
                  Montant
                </dt>
                <dd className="mt-2 text-3xl font-extrabold">
                  {formatAmount(request.amount, request.currency)}
                </dd>
              </div>
            </dl>

            <div className="mt-6 rounded-2xl border border-emerald-100 bg-white p-4">
              <h2 className="font-bold text-emerald-950">Résumé du besoin</h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-600">
                {request.project_description}
              </p>
            </div>
          </section>

          {isPaid ? (
            <aside className="rounded-3xl bg-white p-6 text-center shadow-sm ring-1 ring-emerald-100 sm:p-8">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-700">
                Paiement déjà confirmé
              </p>
              <h2 className="mt-4 text-2xl font-bold text-emerald-950">
                Cette demande est déjà payée.
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Vous pouvez consulter la page de confirmation de votre
                consultation.
              </p>
              <Link
                className="mt-6 inline-flex rounded-full bg-emerald-700 px-6 py-3 font-bold text-white transition hover:bg-emerald-800"
                href={`/consultation/confirmation/${request.id}`}
              >
                Aller à la confirmation
              </Link>
            </aside>
          ) : (
            <ConsultationMockPaymentForm requestId={request.id} />
          )}
        </div>
      </Container>
    </main>
  );
}
