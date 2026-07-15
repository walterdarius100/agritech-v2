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
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                className="inline-flex rounded-full bg-emerald-700 px-6 py-3 font-bold text-white transition hover:bg-emerald-800"
                href="/"
              >
                Retour à l’accueil
              </Link>
              <Link
                className="inline-flex rounded-full border border-emerald-700 px-6 py-3 font-semibold text-emerald-800 transition hover:bg-emerald-50"
                href="/consultation/reserver"
              >
                Refaire une demande
              </Link>
            </div>
          </div>
        </Container>
      </main>
    );
  }

  const isPaid = request.payment_status === "paid";

  return (
    <main className="bg-[#f8faf7] py-16 text-slate-900 sm:py-20 lg:py-24">
      <Container>
        <div className="mx-auto max-w-4xl rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-emerald-100 sm:p-12">
          <p
            className={`text-sm font-bold uppercase tracking-[0.2em] ${isPaid ? "text-emerald-700" : "text-orange-600"}`}
          >
            {isPaid ? "Paiement confirmé" : "Paiement en attente"}
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-emerald-950 sm:text-5xl">
            Votre demande de consultation a été envoyée
          </h1>
          <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-slate-600">
            Votre demande de consultation a été enregistrée avec succès.
            Agri-tech examinera les informations transmises et vous contactera
            pour organiser la suite de l’échange.
          </p>

          {!isPaid ? (
            <div className="mx-auto mt-8 max-w-2xl rounded-2xl border border-orange-200 bg-orange-50 p-5 text-left">
              <h2 className="font-bold text-orange-900">
                Paiement non confirmé
              </h2>
              <p className="mt-2 text-sm leading-6 text-orange-800">
                Votre demande est enregistrée, mais le paiement n’a pas encore
                été confirmé.
              </p>
              <Link
                className="mt-4 inline-flex rounded-full bg-orange-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-orange-700"
                href={`/consultation/checkout/${request.id}`}
              >
                Retourner au checkout
              </Link>
            </div>
          ) : null}

          <dl className="mt-8 grid gap-4 text-left sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl bg-emerald-50 p-4">
              <dt className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
                Code demande
              </dt>
              <dd className="mt-2 font-semibold text-emerald-950">
                {request.request_code}
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
            <div className="rounded-2xl bg-emerald-50 p-4">
              <dt className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
                Montant payé
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

          <section className="mt-8 rounded-3xl bg-emerald-950 p-6 text-left text-white sm:p-8">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-yellow-400">
              Prochaine étape
            </p>
            <h2 className="mt-3 text-2xl font-bold">
              Organisation de la consultation
            </h2>
            <p className="mt-3 leading-7 text-white/80">
              Un membre de l’équipe Agri-tech vous contactera via WhatsApp ou
              par téléphone pour confirmer les informations et organiser la
              consultation.
            </p>
          </section>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap">
            <Link
              className="inline-flex rounded-full bg-emerald-700 px-6 py-3 font-bold text-white transition hover:bg-emerald-800"
              href="/"
            >
              Retour à l’accueil
            </Link>
            <Link
              className="inline-flex rounded-full border border-emerald-700 px-6 py-3 font-semibold text-emerald-800 transition hover:bg-emerald-50"
              href="/services"
            >
              Voir nos services
            </Link>
            <Link
              className="inline-flex rounded-full border border-slate-300 px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
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
