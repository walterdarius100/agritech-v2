import Link from "next/link";

import { requireAuthorizedAdmin } from "@/lib/auth/adminAuth";
import {
  crmInterestLabels,
  crmInterestLevels,
  crmManualSourceLabels,
  crmManualSources,
  crmPriorities,
  crmPriorityLabels,
  crmStatusLabels,
  crmStatuses,
} from "@/lib/crm/adminPipeline";
import { createManualClientPipelineCase } from "@/lib/crm/adminPipelineActions";

export const dynamic = "force-dynamic";

type Option = { value: string; label: string };

function Field({ label, name, required = false, type = "text" }: { label: string; name: string; required?: boolean; type?: string }) {
  return (
    <label className="flex flex-col gap-1 text-sm font-semibold text-slate-700">
      {label}{required ? <span className="text-xs font-bold text-emerald-700">Obligatoire</span> : null}
      <input className="rounded-xl border border-slate-200 px-3 py-2 font-medium text-slate-900" name={name} required={required} type={type} />
    </label>
  );
}

function SelectField({ label, name, required = false, defaultValue, options }: { label: string; name: string; required?: boolean; defaultValue: string; options: Option[] }) {
  return (
    <label className="flex flex-col gap-1 text-sm font-semibold text-slate-700">
      {label}{required ? <span className="text-xs font-bold text-emerald-700">Obligatoire</span> : null}
      <select className="rounded-xl border border-slate-200 bg-white px-3 py-2 font-medium text-slate-900" name={name} required={required} defaultValue={defaultValue}>
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>
  );
}

function TextArea({ label, name }: { label: string; name: string }) {
  return <label className="flex flex-col gap-1 text-sm font-semibold text-slate-700">{label}<textarea className="min-h-36 rounded-xl border border-slate-200 px-3 py-2 font-medium text-slate-900" name={name} /></label>;
}

export default async function NewCrmCasePage() {
  await requireAuthorizedAdmin();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link className="font-semibold text-emerald-800" href="/admin/suivi">← Retour au suivi</Link>
          <p className="mt-4 text-sm font-bold uppercase tracking-[0.22em] text-emerald-700">CRM</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950">Nouveau dossier</h1>
          <p className="mt-2 max-w-3xl text-slate-600">Création admin protégée d’un dossier CRM manuel pour les prospects issus de WhatsApp, réseaux sociaux, appels, références, terrain ou emails directs.</p>
        </div>
      </div>

      <form action={createManualClientPipelineCase} className="space-y-6">
        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-lg font-bold text-slate-950">Informations client</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Field label="Nom client / Organisation" name="client_name" required />
            <Field label="Contact principal" name="primary_contact" />
            <Field label="Téléphone" name="phone" />
            <Field label="Email" name="email" type="email" />
          </div>
        </section>

        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-lg font-bold text-slate-950">Projet et origine</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Field label="Type de projet" name="project_type" />
            <Field label="Localisation" name="location" />
            <SelectField label="Source" name="source" required defaultValue="whatsapp" options={crmManualSources.map((value) => ({ value, label: crmManualSourceLabels[value] }))} />
            <Field label="Canal principal" name="main_channel" />
            <SelectField label="Niveau intérêt" name="interest_level" defaultValue="moyen" options={crmInterestLevels.map((value) => ({ value, label: crmInterestLabels[value] }))} />
          </div>
        </section>

        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-lg font-bold text-slate-950">Suivi commercial</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <SelectField label="Priorité" name="priority" required defaultValue="normale" options={crmPriorities.map((value) => ({ value, label: crmPriorityLabels[value] }))} />
            <SelectField label="Statut" name="status" required defaultValue="nouveau" options={crmStatuses.map((value) => ({ value, label: crmStatusLabels[value] }))} />
            <Field label="Prochaine action" name="next_action" />
            <Field label="Responsable" name="responsible" />
            <Field label="Date prochaine action" name="next_action_at" type="date" />
          </div>
        </section>

        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-lg font-bold text-slate-950">Notes internes</h2>
          <div className="mt-4"><TextArea label="Notes internes" name="admin_notes" /></div>
        </section>

        <div className="sticky bottom-4 flex justify-end gap-3 rounded-2xl bg-white/90 p-3 shadow-lg ring-1 ring-slate-200 backdrop-blur">
          <Link className="rounded-xl bg-slate-100 px-5 py-3 text-sm font-bold text-slate-700" href="/admin/suivi">Annuler</Link>
          <button className="rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white" type="submit">Créer le dossier</button>
        </div>
      </form>
    </div>
  );
}
