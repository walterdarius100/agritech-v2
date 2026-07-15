"use client";

import { useActionState } from "react";

import type { ConsultationAdminFormState } from "@/lib/consultation/adminConsultations";
import { getConsultationRequestStatusLabel } from "@/lib/consultation/statusLabels";
import type {
  ConsultationRequest,
  ConsultationRequestStatus,
} from "@/types/consultation";

const statusOptions: ConsultationRequestStatus[] = [
  "pending_payment",
  "paid",
  "scheduled",
  "completed",
  "cancelled",
  "failed_payment",
];

export function ConsultationRequestAdminForm({
  request,
  action,
}: {
  request: ConsultationRequest;
  action: (
    state: ConsultationAdminFormState,
    formData: FormData,
  ) => Promise<ConsultationAdminFormState>;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form
      action={formAction}
      className="grid gap-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
    >
      <label className="grid gap-2 text-sm font-semibold text-slate-800">
        Statut demande
        <select
          className="rounded-xl border border-slate-200 px-3 py-2"
          name="request_status"
          defaultValue={request.request_status}
        >
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {getConsultationRequestStatusLabel(status)}
            </option>
          ))}
        </select>
      </label>

      <label className="grid gap-2 text-sm font-semibold text-slate-800">
        Notes internes
        <textarea
          className="rounded-xl border border-slate-200 px-3 py-2"
          name="admin_notes"
          defaultValue={request.admin_notes ?? ""}
          maxLength={5000}
          rows={8}
        />
      </label>

      <div className="flex flex-col items-start gap-3 pt-1">
        <button
          className="inline-flex items-center justify-center rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={pending}
          type="submit"
        >
          {pending ? "Mise à jour..." : "Mettre à jour"}
        </button>
        {state.error ? (
          <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
            {state.error}
          </p>
        ) : null}
        {state.success ? (
          <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            {state.success}
          </p>
        ) : null}
      </div>
    </form>
  );
}
