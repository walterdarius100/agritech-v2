"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { addAdminClientPipelineInteraction } from "@/lib/crm/adminPipelineActions";

type Option = { value: string; label: string };

type Props = {
  caseId: string;
  options: {
    interactionTypes: Option[];
    channels: Option[];
    statuses: Option[];
  };
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return <button className="rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white disabled:cursor-wait disabled:bg-emerald-400" disabled={pending} type="submit">{pending ? "Ajout..." : "Ajouter l’interaction"}</button>;
}

function SelectField({ label, name, required = false, defaultValue, options, allowEmpty = false }: { label: string; name: string; required?: boolean; defaultValue?: string; options: Option[]; allowEmpty?: boolean }) {
  return <label className="flex flex-col gap-1 text-sm font-semibold text-slate-700">{label}{required ? <span className="text-xs font-bold text-emerald-700">Obligatoire</span> : null}<select className="rounded-xl border border-slate-200 bg-white px-3 py-2 font-medium text-slate-900" name={name} required={required} defaultValue={defaultValue ?? ""}>{allowEmpty ? <option value="">Ne pas modifier</option> : null}{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>;
}

function Field({ label, name, required = false, type = "text" }: { label: string; name: string; required?: boolean; type?: string }) {
  return <label className="flex flex-col gap-1 text-sm font-semibold text-slate-700">{label}{required ? <span className="text-xs font-bold text-emerald-700">Obligatoire</span> : null}<input className="rounded-xl border border-slate-200 px-3 py-2 font-medium text-slate-900" name={name} required={required} type={type} /></label>;
}

function TextArea({ label, name, required = false }: { label: string; name: string; required?: boolean }) {
  return <label className="flex flex-col gap-1 text-sm font-semibold text-slate-700">{label}{required ? <span className="text-xs font-bold text-emerald-700">Obligatoire</span> : null}<textarea className="min-h-28 rounded-xl border border-slate-200 px-3 py-2 font-medium text-slate-900" name={name} required={required} /></label>;
}

export function CrmInteractionForm({ caseId, options }: Props) {
  const [state, formAction] = useActionState(addAdminClientPipelineInteraction.bind(null, caseId), {});

  return <form action={formAction} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
    <h2 className="text-lg font-bold text-slate-950">Ajouter une interaction</h2>
    <p className="mt-1 text-sm text-slate-600">Chaque ajout met à jour la dernière interaction du dossier. Les champs de prochaine action restent optionnels.</p>
    {state.success ? <p className="mt-4 rounded-xl bg-emerald-50 p-4 text-sm font-bold text-emerald-800 ring-1 ring-emerald-200">{state.success}</p> : null}
    {state.error ? <p className="mt-4 rounded-xl bg-red-50 p-4 text-sm font-bold text-red-800 ring-1 ring-red-200">{state.error}</p> : null}
    <div className="mt-4 grid gap-4 md:grid-cols-2">
      <SelectField label="Type d’interaction" name="interaction_type" required defaultValue="note" options={options.interactionTypes} />
      <SelectField label="Canal" name="channel" allowEmpty options={options.channels} />
      <Field label="Date" name="interaction_date" type="datetime-local" />
      <Field label="Créé par" name="created_by" />
      <TextArea label="Résumé" name="summary" required />
      <TextArea label="Détails" name="details" />
    </div>
    <details className="mt-4 rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
      <summary className="cursor-pointer text-sm font-bold text-slate-800">Mettre aussi à jour le suivi du dossier</summary>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <Field label="Prochaine action" name="next_action" />
        <Field label="Date prochaine action" name="next_action_at" type="date" />
        <SelectField label="Statut" name="status" allowEmpty options={options.statuses} />
      </div>
    </details>
    <div className="mt-4 flex justify-end"><SubmitButton /></div>
  </form>;
}
