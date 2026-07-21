import Link from "next/link";

import {
  getAdminConsultationRequests,
  normalizeConsultationFilter,
  type ConsultationAdminFilter,
} from "@/lib/consultation/adminConsultations";
import {
  consultationRequestStatuses,
  getConsultationRequestStatusLabel,
  getConsultationStatusBadgeClass,
} from "@/lib/consultation/statusLabels";

function formatAmount(amount: number, currency: string) {
  return `${Number(amount).toLocaleString("fr-FR")} ${currency}`;
}

function StatusBadge({
  status,
}: {
  status: (typeof consultationRequestStatuses)[number];
}) {
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold ${getConsultationStatusBadgeClass(status)}`}
    >
      {getConsultationRequestStatusLabel(status)}
    </span>
  );
}

const filters: { value: ConsultationAdminFilter; label: string }[] = [
  { value: "all", label: "Tous" },
  ...consultationRequestStatuses.map((status) => ({
    value: status,
    label: getConsultationRequestStatusLabel(status),
  })),
];

export default async function AdminConsultationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const activeFilter = normalizeConsultationFilter(status);
  const requests = await getAdminConsultationRequests(activeFilter);

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Consultations</h1>
          <p className="mt-2 text-slate-600">
            Suivi des demandes de consultation et de leur statut de paiement.
          </p>
        </div>
        <Link
          className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white"
          href="/consultation/reserver"
        >
          Voir la page publique
        </Link>
      </div>

      <nav
        className="mt-6 flex flex-wrap gap-2"
        aria-label="Filtres consultations"
      >
        {filters.map((filter) => {
          const href =
            filter.value === "all"
              ? "/admin/consultations"
              : `/admin/consultations?status=${filter.value}`;
          const isActive = activeFilter === filter.value;

          return (
            <Link
              key={filter.value}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                isActive
                  ? "bg-emerald-700 text-white"
                  : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-emerald-50"
              }`}
              href={href}
            >
              {filter.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-6 overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <table className="w-full min-w-[1200px] text-left text-sm">
          <thead className="whitespace-nowrap bg-slate-100 text-slate-600">
            <tr>
              <th className="p-4">Code demande</th>
              <th>Nom</th>
              <th>Téléphone</th>
              <th>Email</th>
              <th>Domaine</th>
              <th>Commune</th>
              <th>Package</th>
              <th>Montant</th>
              <th>Paiement</th>
              <th>Statut demande</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => (
              <tr
                className="border-t border-slate-100 align-top"
                key={request.id}
              >
                <td className="whitespace-nowrap p-4 font-bold text-emerald-900">
                  {request.request_code}
                </td>
                <td className="whitespace-nowrap font-semibold text-slate-950">
                  {request.full_name}
                </td>
                <td className="whitespace-nowrap">{request.phone}</td>
                <td className="whitespace-nowrap">{request.email ?? "—"}</td>
                <td className="whitespace-nowrap">{request.consultation_type}</td>
                <td className="whitespace-nowrap">{request.commune ?? "—"}</td>
                <td className="max-w-56 truncate whitespace-nowrap text-slate-600" title={request.consultation_package}>
                  {request.consultation_package}
                </td>
                <td className="whitespace-nowrap font-semibold">
                  {formatAmount(request.amount, request.currency)}
                </td>
                <td className="whitespace-nowrap">{request.payment_status}</td>
                <td className="whitespace-nowrap">
                  <StatusBadge status={request.request_status} />
                </td>
                <td className="whitespace-nowrap">
                  {new Date(request.created_at).toLocaleDateString("fr-FR")}
                </td>
                <td className="whitespace-nowrap">
                  <Link
                    className="font-semibold text-emerald-800"
                    href={`/admin/consultations/${request.id}`}
                  >
                    Voir détail
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {requests.length === 0 ? (
          <p className="p-6 text-slate-500">
            Aucune demande de consultation pour ce filtre.
          </p>
        ) : null}
      </div>
    </div>
  );
}
