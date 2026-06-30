"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/Button";
import type { ContactRequestFormState } from "@/lib/contact/adminContactRequests";
import type { ContactRequest, ContactRequestPriority, ContactRequestStatus } from "@/types/contact";

const statusOptions: { value: ContactRequestStatus; label: string }[] = [
  { value: "new", label: "Nouveau" },
  { value: "in_review", label: "En cours d’étude" },
  { value: "contacted", label: "Contacté" },
  { value: "converted", label: "Converti" },
  { value: "closed", label: "Clôturé" },
  { value: "spam", label: "Spam" },
];

const priorityOptions: { value: ContactRequestPriority; label: string }[] = [
  { value: "low", label: "Faible" },
  { value: "normal", label: "Normale" },
  { value: "high", label: "Haute" },
  { value: "urgent", label: "Urgente" },
];

export function ContactRequestAdminForm({ request, action }: { request: ContactRequest; action: (state: ContactRequestFormState, formData: FormData) => Promise<ContactRequestFormState> }) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="grid gap-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-semibold text-slate-800">Statut<select className="rounded-xl border border-slate-200 px-3 py-2" name="status" defaultValue={request.status}>{statusOptions.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}</select></label>
        <label className="grid gap-2 text-sm font-semibold text-slate-800">Priorité<select className="rounded-xl border border-slate-200 px-3 py-2" name="priority" defaultValue={request.priority}>{priorityOptions.map((priority) => <option key={priority.value} value={priority.value}>{priority.label}</option>)}</select></label>
      </div>
      <label className="grid gap-2 text-sm font-semibold text-slate-800">Notes internes<textarea className="rounded-xl border border-slate-200 px-3 py-2" name="admin_notes" defaultValue={request.admin_notes ?? ""} maxLength={5000} rows={6} /></label>
      <Button className="w-fit" disabled={pending} type="submit">{pending ? "Mise à jour..." : "Mettre à jour"}</Button>
      {state.error ? <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{state.error}</p> : null}
      {state.success ? <p className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{state.success}</p> : null}
    </form>
  );
}
