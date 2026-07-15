import type { ConsultationRequestStatus } from "@/types/consultation";

export const consultationRequestStatuses: ConsultationRequestStatus[] = [
  "pending_payment",
  "paid",
  "scheduled",
  "completed",
  "cancelled",
  "failed_payment",
];

export function getConsultationRequestStatusLabel(
  status: ConsultationRequestStatus,
) {
  const labels: Record<ConsultationRequestStatus, string> = {
    pending_payment: "En attente de paiement",
    paid: "Payée",
    scheduled: "Planifiée",
    completed: "Terminée",
    cancelled: "Annulée",
    failed_payment: "Paiement échoué",
  };

  return labels[status];
}

export function getConsultationStatusBadgeClass(
  status: ConsultationRequestStatus,
) {
  const classes: Record<ConsultationRequestStatus, string> = {
    pending_payment: "bg-yellow-100 text-yellow-900",
    paid: "bg-emerald-100 text-emerald-900",
    scheduled: "bg-sky-100 text-sky-900",
    completed: "bg-slate-900 text-white",
    cancelled: "bg-slate-200 text-slate-700",
    failed_payment: "bg-red-100 text-red-800",
  };

  return classes[status];
}
