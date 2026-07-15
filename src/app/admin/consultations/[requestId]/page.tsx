import Link from "next/link";
import { notFound } from "next/navigation";

import { ConsultationRequestAdminForm } from "@/components/admin/ConsultationRequestAdminForm";
import {
  getAdminConsultationRequestById,
  updateAdminConsultationRequest,
} from "@/lib/consultation/adminConsultations";
import {
  getConsultationRequestStatusLabel,
  getConsultationStatusBadgeClass,
} from "@/lib/consultation/statusLabels";
import type { ConsultationPaymentStatus } from "@/types/consultation";

function formatAmount(amount: number, currency: string) {
  return `${Number(amount).toLocaleString("fr-FR")} ${currency}`;
}

function Info({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt className="font-semibold text-slate-500">{label}</dt>
      <dd className="mt-1 whitespace-pre-wrap text-slate-900">
        {value || "—"}
      </dd>
    </div>
  );
}

function paymentStatusLabel(status: ConsultationPaymentStatus) {
  const labels: Record<ConsultationPaymentStatus, string> = {
    pending: "En attente",
    paid: "Payé",
    failed: "Échoué",
    cancelled: "Annulé",
    refunded: "Remboursé",
  };

  return labels[status];
}

export default async function AdminConsultationDetailPage({
  params,
}: {
  params: Promise<{ requestId: string }>;
}) {
  const { requestId } = await params;
  const request = await getAdminConsultationRequestById(requestId);
  if (!request) notFound();

  const action = updateAdminConsultationRequest.bind(null, request.id);

  return (
    <div>
      <Link
        className="text-sm font-semibold text-emerald-800"
        href="/admin/consultations"
      >
        ← Consultations
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-emerald-700">
            {request.request_code}
          </p>
          <h1 className="mt-2 text-3xl font-bold">
            Consultation de {request.full_name}
          </h1>
          <p className="mt-2 text-slate-600">
            Reçue le {new Date(request.created_at).toLocaleString("fr-FR")}
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-sm font-bold ${getConsultationStatusBadgeClass(request.request_status)}`}
        >
          {getConsultationRequestStatusLabel(request.request_status)}
        </span>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-xl font-bold">Informations client</h2>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <Info label="Nom" value={request.full_name} />
              <Info label="Téléphone" value={request.phone} />
              <Info label="Email" value={request.email} />
              <Info label="Département" value={request.department} />
              <Info label="Commune" value={request.commune} />
              <Info label="Mode souhaité" value={request.consultation_mode} />
            </dl>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-xl font-bold">Projet</h2>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <Info label="Domaine" value={request.consultation_type} />
              <Info label="Niveau d’avancement" value={request.project_stage} />
              <Info label="Budget" value={request.estimated_budget} />
              <Info label="Package" value={request.consultation_package} />
              <Info
                label="Montant"
                value={formatAmount(request.amount, request.currency)}
              />
              <Info label="Paiement" value={request.payment_status} />
            </dl>
            <div className="mt-6">
              <h3 className="font-bold text-slate-950">
                Description du besoin
              </h3>
              <p className="mt-3 whitespace-pre-wrap rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                {request.project_description}
              </p>
            </div>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-xl font-bold">Historique paiement</h2>
            {request.payments.length ? (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead className="text-slate-500">
                    <tr>
                      <th className="py-2">Date</th>
                      <th>Provider</th>
                      <th>Méthode</th>
                      <th>Montant</th>
                      <th>Statut</th>
                      <th>Référence</th>
                    </tr>
                  </thead>
                  <tbody>
                    {request.payments.map((payment) => (
                      <tr
                        className="border-t border-slate-100"
                        key={payment.id}
                      >
                        <td className="py-3">
                          {new Date(payment.created_at).toLocaleString("fr-FR")}
                        </td>
                        <td>{payment.provider}</td>
                        <td>{payment.payment_method ?? "—"}</td>
                        <td>
                          {formatAmount(payment.amount, payment.currency)}
                        </td>
                        <td>{paymentStatusLabel(payment.status)}</td>
                        <td>{payment.provider_transaction_id ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-500">
                Aucun paiement enregistré.
              </p>
            )}
          </section>
        </div>

        <ConsultationRequestAdminForm action={action} request={request} />
      </div>
    </div>
  );
}
