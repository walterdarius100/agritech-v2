import Link from "next/link";
import { notFound } from "next/navigation";

import { CrmCaseForm } from "./CrmCaseForm";
import {
  crmInterestLabels,
  crmInterestLevels,
  crmOutcomeLabels,
  crmOutcomes,
  crmPriorities,
  crmPriorityLabels,
  crmSourceLabels,
  crmStatusLabels,
  crmStatuses,
  getAdminClientPipelineCaseById,
} from "@/lib/crm/adminPipeline";
import type { ClientPipelineCase } from "@/types/crm";

export const dynamic = "force-dynamic";

function formatDateTime(value?: string | null) { return value ? new Date(value).toLocaleString("fr-FR") : "—"; }
function formatDate(value?: string | null) { return value ? new Date(value).toLocaleDateString("fr-FR") : "—"; }
function daysWithoutInteraction(item: ClientPipelineCase) { const t = new Date(item.last_interaction_at ?? item.first_contact_at ?? item.created_at).getTime(); return Number.isNaN(t) ? "—" : String(Math.max(0, Math.floor((Date.now() - t) / 86_400_000))); }
function sourceHref(item: ClientPipelineCase) { if (!item.source_id) return null; if (item.source_type === "contact") return `/admin/contact-requests/${item.source_id}`; if (item.source_type === "consultation") return `/admin/consultations/${item.source_id}`; return null; }
function ReadOnly({ label, value }: { label: string; value: string | number | null | undefined }) { return <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200"><dt className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</dt><dd className="mt-1 break-words font-semibold text-slate-900">{value ?? "—"}</dd></div>; }

export default async function AdminCrmCaseDetailPage({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = await params;
  const item = await getAdminClientPipelineCaseById(caseId);
  if (!item) notFound();
  const href = sourceHref(item);
  const options = {
    statuses: crmStatuses.map((value) => ({ value, label: crmStatusLabels[value] })),
    priorities: crmPriorities.map((value) => ({ value, label: crmPriorityLabels[value] })),
    interests: crmInterestLevels.map((value) => ({ value, label: crmInterestLabels[value] })),
    outcomes: crmOutcomes.map((value) => ({ value, label: crmOutcomeLabels[value] })),
  };

  return <div className="space-y-6">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div><Link className="font-semibold text-emerald-800" href="/admin/suivi">← Retour au suivi</Link><p className="mt-4 text-sm font-bold uppercase tracking-[0.22em] text-emerald-700">Fiche dossier CRM</p><h1 className="mt-2 text-3xl font-bold text-slate-950">{item.case_code}</h1><p className="mt-2 text-slate-600">Fiche admin protégée pour consulter le dossier et modifier les informations de suivi commercial.</p></div>
      <div className="rounded-2xl bg-white p-4 text-sm shadow-sm ring-1 ring-slate-200"><p className="font-bold text-slate-950">Source : {crmSourceLabels[item.source_type]}</p><p className="mt-1 text-slate-600">ID source : {item.source_id ?? "—"}</p>{href ? <Link className="mt-3 inline-flex font-bold text-emerald-800" href={href}>Voir la demande {crmSourceLabels[item.source_type]} d’origine</Link> : null}</div>
    </div>

    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"><h2 className="text-lg font-bold text-slate-950">Résumé du dossier</h2><dl className="mt-4 grid gap-3 md:grid-cols-3"><ReadOnly label="ID dossier" value={item.case_code} /><ReadOnly label="ID technique" value={item.id} /><ReadOnly label="Date 1er contact" value={formatDateTime(item.first_contact_at)} /><ReadOnly label="Statut" value={crmStatusLabels[item.status]} /><ReadOnly label="Priorité" value={crmPriorityLabels[item.priority]} /><ReadOnly label="Niveau intérêt" value={crmInterestLabels[item.interest_level]} /><ReadOnly label="Dernière interaction" value={formatDateTime(item.last_interaction_at)} /><ReadOnly label="Jours sans interaction" value={daysWithoutInteraction(item)} /><ReadOnly label="Alerte suivi" value={item.alert_follow_up ? "Oui" : "Non"} /></dl></section>

    <CrmCaseForm item={item} options={options} />

    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"><h2 className="text-lg font-bold text-slate-950">Source d’origine</h2><dl className="mt-4 grid gap-3 md:grid-cols-2"><ReadOnly label="Source" value={crmSourceLabels[item.source_type]} /><ReadOnly label="ID source" value={item.source_id} /><ReadOnly label="Source CRM" value={item.source} /><ReadOnly label="Créé le" value={formatDateTime(item.created_at)} /><ReadOnly label="Mis à jour le" value={formatDateTime(item.updated_at)} /><ReadOnly label="Date réunion prévue" value={formatDate(item.meeting_date)} /></dl>{href ? <Link className="mt-4 inline-flex rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-800" href={href}>Voir la demande {crmSourceLabels[item.source_type]} d’origine</Link> : null}</section>
  </div>;
}
