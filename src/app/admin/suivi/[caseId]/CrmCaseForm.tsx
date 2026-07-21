"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { updateAdminClientPipelineCase } from "@/lib/crm/adminPipelineActions";
import type { ClientPipelineCase } from "@/types/crm";

type Option = { value: string; label: string };

type Props = { item: ClientPipelineCase; options: { statuses: Option[]; priorities: Option[]; interests: Option[]; outcomes: Option[] } };

function SaveButton() {
  const { pending } = useFormStatus();
  return <button className="rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white disabled:cursor-wait disabled:bg-emerald-400" disabled={pending} type="submit">{pending ? "Enregistrement..." : "Enregistrer"}</button>;
}

function Field({ label, name, defaultValue, type = "text" }: { label: string; name: keyof ClientPipelineCase; defaultValue?: string | number | null; type?: string }) {
  return <label className="flex flex-col gap-1 text-sm font-semibold text-slate-700">{label}<input className="rounded-xl border border-slate-200 px-3 py-2 font-medium text-slate-900" name={name} type={type} defaultValue={defaultValue ?? ""} /></label>;
}

function SelectField({ label, name, defaultValue, options }: { label: string; name: keyof ClientPipelineCase; defaultValue: string; options: Option[] }) {
  return <label className="flex flex-col gap-1 text-sm font-semibold text-slate-700">{label}<select className="rounded-xl border border-slate-200 bg-white px-3 py-2 font-medium text-slate-900" name={name} defaultValue={defaultValue}>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>;
}

function TextArea({ label, name, defaultValue }: { label: string; name: keyof ClientPipelineCase; defaultValue?: string | null }) {
  return <label className="flex flex-col gap-1 text-sm font-semibold text-slate-700">{label}<textarea className="min-h-32 rounded-xl border border-slate-200 px-3 py-2 font-medium text-slate-900" name={name} defaultValue={defaultValue ?? ""} /></label>;
}

export function CrmCaseForm({ item, options }: Props) {
  const [state, formAction] = useActionState(updateAdminClientPipelineCase.bind(null, item.id), {});
  return <form action={formAction} className="space-y-6">
    {state.success ? <p className="rounded-xl bg-emerald-50 p-4 text-sm font-bold text-emerald-800 ring-1 ring-emerald-200">{state.success}</p> : null}
    {state.error ? <p className="rounded-xl bg-red-50 p-4 text-sm font-bold text-red-800 ring-1 ring-red-200">{state.error}</p> : null}
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"><h2 className="text-lg font-bold text-slate-950">Informations client</h2><div className="mt-4 grid gap-4 md:grid-cols-2"><Field label="Nom client" name="client_name" defaultValue={item.client_name} /><Field label="Organisation" name="organization_name" defaultValue={item.organization_name} /><Field label="Contact principal" name="primary_contact" defaultValue={item.primary_contact} /><Field label="Téléphone" name="phone" defaultValue={item.phone} /><Field label="Email" name="email" type="email" defaultValue={item.email} /></div></section>
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"><h2 className="text-lg font-bold text-slate-950">Projet / besoin</h2><div className="mt-4 grid gap-4 md:grid-cols-2"><Field label="Type de projet" name="project_type" defaultValue={item.project_type} /><Field label="Localisation" name="location" defaultValue={item.location} /><Field label="Canal principal" name="main_channel" defaultValue={item.main_channel} /><SelectField label="Niveau intérêt" name="interest_level" defaultValue={item.interest_level} options={options.interests} /></div></section>
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"><h2 className="text-lg font-bold text-slate-950">Suivi commercial</h2><div className="mt-4 grid gap-4 md:grid-cols-2"><SelectField label="Priorité" name="priority" defaultValue={item.priority} options={options.priorities} /><SelectField label="Statut" name="status" defaultValue={item.status} options={options.statuses} /><Field label="Prochaine action" name="next_action" defaultValue={item.next_action} /><Field label="Responsable" name="responsible" defaultValue={item.responsible} /><Field label="Date prochaine action" name="next_action_at" type="date" defaultValue={item.next_action_at} /></div></section>
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"><h2 className="text-lg font-bold text-slate-950">Réunion</h2><div className="mt-4 grid gap-4 md:grid-cols-2"><Field label="Date réunion prévue" name="meeting_date" type="date" defaultValue={item.meeting_date} /><Field label="Heure réunion prévue" name="meeting_time" type="time" defaultValue={item.meeting_time} /><label className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 text-sm font-semibold"><input name="meeting_confirmed" type="checkbox" defaultChecked={item.meeting_confirmed} /> Réunion confirmée ?</label><Field label="Décision après réunion" name="post_meeting_decision" defaultValue={item.post_meeting_decision} /></div></section>
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"><h2 className="text-lg font-bold text-slate-950">Proposition et relances</h2><div className="mt-4 grid gap-4 md:grid-cols-2"><Field label="Date proposition envoyée" name="proposal_sent_at" type="date" defaultValue={item.proposal_sent_at} /><Field label="Montant proposé USD" name="proposed_amount_usd" type="number" defaultValue={item.proposed_amount_usd} /><Field label="Date relance 1" name="follow_up_1_at" type="date" defaultValue={item.follow_up_1_at} /><Field label="Date relance 2" name="follow_up_2_at" type="date" defaultValue={item.follow_up_2_at} /></div></section>
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"><h2 className="text-lg font-bold text-slate-950">Décision / issue</h2><div className="mt-4 grid gap-4 md:grid-cols-2"><Field label="Date clôture prévue" name="expected_close_at" type="date" defaultValue={item.expected_close_at} /><Field label="Décision attendue" name="expected_decision" defaultValue={item.expected_decision} /><SelectField label="Issue" name="outcome" defaultValue={item.outcome} options={options.outcomes} /></div></section>
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"><h2 className="text-lg font-bold text-slate-950">Notes internes</h2><div className="mt-4"><TextArea label="Notes internes" name="admin_notes" defaultValue={item.admin_notes} /></div></section>
    <div className="sticky bottom-4 flex justify-end rounded-2xl bg-white/90 p-3 shadow-lg ring-1 ring-slate-200 backdrop-blur"><SaveButton /></div>
  </form>;
}
