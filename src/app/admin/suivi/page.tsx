import Link from "next/link";

import { requireAuthorizedAdmin } from "@/lib/auth/adminAuth";
import {
  crmInterestLevels,
  crmOutcomes,
  crmPriorities,
  crmSources,
  crmStatuses,
  getAdminClientPipelineCases,
  normalizeCrmFilters,
  type CrmPipelineFilters,
} from "@/lib/crm/adminPipeline";
import type { ClientPipelineCase, CrmStatus } from "@/types/crm";

export const dynamic = "force-dynamic";

const statusLabels = {
  nouveau: "Nouveau",
  a_qualifier: "À qualifier",
  reunion_a_planifier: "Réunion à planifier",
  reunion_prevue: "Réunion prévue",
  proposition_a_preparer: "Proposition à préparer",
  proposition_envoyee: "Proposition envoyée",
  relance_1: "Relance 1",
  relance_2: "Relance 2",
  gagne: "Gagné",
  perdu: "Perdu",
  en_attente: "En attente",
  archive: "Archivé",
} as const;

const sourceLabels = { contact: "Contact", consultation: "Consultation", manual: "Manuel" } as const;
const priorityLabels = { basse: "Basse", normale: "Normale", haute: "Haute", urgente: "Urgente" } as const;
const interestLabels = { faible: "Faible", moyen: "Moyen", eleve: "Élevé", tres_eleve: "Très élevé" } as const;
const outcomeLabels = { en_cours: "En cours", gagne: "Gagné", perdu: "Perdu", abandonne: "Abandonné", non_qualifie: "Non qualifié" } as const;

function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("fr-FR", { dateStyle: "short" });
}

function getDaysWithoutInteraction(item: ClientPipelineCase) {
  const reference = item.last_interaction_at ?? item.first_contact_at ?? item.created_at;
  const timestamp = new Date(reference).getTime();
  if (Number.isNaN(timestamp)) return null;
  return Math.max(0, Math.floor((Date.now() - timestamp) / 86_400_000));
}

const activeStatuses: CrmStatus[] = ["nouveau", "a_qualifier", "reunion_a_planifier", "reunion_prevue", "proposition_a_preparer", "proposition_envoyee", "relance_1", "relance_2", "en_attente"];
const inactiveStatuses: CrmStatus[] = ["gagne", "perdu", "archive"];

type AlertBadge = "Action aujourd’hui" | "En retard" | "À relancer" | "Aucune prochaine action" | "Priorité urgente";

function startOfToday() { const today = new Date(); today.setHours(0, 0, 0, 0); return today; }
function getDateOnlyTime(value?: string | null) { if (!value) return null; const date = new Date(`${value}T00:00:00`); return Number.isNaN(date.getTime()) ? null : date.getTime(); }
function isActiveCase(item: ClientPipelineCase) { return activeStatuses.includes(item.status); }
function getAlertBadges(item: ClientPipelineCase, days: number | null): AlertBadge[] {
  if (!isActiveCase(item) || inactiveStatuses.includes(item.status)) return [];
  const alerts: AlertBadge[] = [];
  const today = startOfToday().getTime();
  const nextActionTime = getDateOnlyTime(item.next_action_at);

  if (nextActionTime !== null && nextActionTime < today) alerts.push("En retard");
  if (nextActionTime !== null && nextActionTime === today) alerts.push("Action aujourd’hui");
  if ((days ?? 0) >= 7 || item.alert_follow_up) alerts.push("À relancer");
  if (!item.next_action_at) alerts.push("Aucune prochaine action");
  if (item.priority === "urgente") alerts.push("Priorité urgente");
  return alerts;
}
function isPriorityCase(item: ClientPipelineCase) { return isActiveCase(item) && ["haute", "urgente"].includes(item.priority); }
function isActionableCase(item: ClientPipelineCase) { const days = getDaysWithoutInteraction(item); return getAlertBadges(item, days).length > 0 || isPriorityCase(item); }
function hasOverdueAction(item: ClientPipelineCase) { return getAlertBadges(item, getDaysWithoutInteraction(item)).includes("En retard"); }
function sortActionableCases(items: ClientPipelineCase[]) {
  return [...items].sort((a, b) => {
    const aOverdue = hasOverdueAction(a) ? 1 : 0;
    const bOverdue = hasOverdueAction(b) ? 1 : 0;
    if (aOverdue !== bOverdue) return bOverdue - aOverdue;
    const aUrgent = a.priority === "urgente" ? 1 : 0;
    const bUrgent = b.priority === "urgente" ? 1 : 0;
    if (aUrgent !== bUrgent) return bUrgent - aUrgent;
    const aNext = getDateOnlyTime(a.next_action_at) ?? Number.MAX_SAFE_INTEGER;
    const bNext = getDateOnlyTime(b.next_action_at) ?? Number.MAX_SAFE_INTEGER;
    if (aNext !== bNext) return aNext - bNext;
    const aDays = getDaysWithoutInteraction(a) ?? -1;
    const bDays = getDaysWithoutInteraction(b) ?? -1;
    if (aDays !== bDays) return bDays - aDays;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}
function buildSummary(items: ClientPipelineCase[]) {
  return {
    newCases: items.filter((item) => item.status === "nouveau").length,
    actionable: items.filter(isActionableCase).length,
    overdue: items.filter(hasOverdueAction).length,
    proposals: items.filter((item) => item.status === "proposition_envoyee").length,
    won: items.filter((item) => item.status === "gagne").length,
    lost: items.filter((item) => item.status === "perdu").length,
  };
}

function badgeClass(kind: "status" | "priority" | "interest" | "source" | "outcome" | "alert", value: string) {
  if (kind === "priority" && ["haute", "urgente"].includes(value)) return "bg-red-50 text-red-700 ring-red-200";
  if (kind === "alert" && value === "En retard") return "bg-red-50 text-red-700 ring-red-200";
  if (kind === "alert" && value === "Action aujourd’hui") return "bg-sky-50 text-sky-800 ring-sky-200";
  if (kind === "alert" && value !== "RAS") return "bg-amber-50 text-amber-800 ring-amber-200";
  if (kind === "status" && ["gagne"].includes(value)) return "bg-emerald-50 text-emerald-800 ring-emerald-200";
  if (kind === "status" && ["perdu", "archive"].includes(value)) return "bg-slate-100 text-slate-700 ring-slate-200";
  if (kind === "outcome" && value === "perdu") return "bg-red-50 text-red-700 ring-red-200";
  return "bg-emerald-50 text-emerald-800 ring-emerald-200";
}

function Badge({ kind, value, children }: { kind: "status" | "priority" | "interest" | "source" | "outcome" | "alert"; value: string; children: string }) {
  return <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${badgeClass(kind, value)}`}>{children}</span>;
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p><p className="mt-2 text-2xl font-black text-slate-950">{value}</p></div>;
}

function SelectFilter({ name, label, value, options }: { name: keyof CrmPipelineFilters; label: string; value?: string; options: { value: string; label: string }[] }) {
  return (
    <label className="flex min-w-40 flex-col gap-1 text-xs font-bold uppercase tracking-wide text-slate-500">
      {label}
      <select className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold normal-case tracking-normal text-slate-800" name={name} defaultValue={value ?? "all"}>
        <option value="all">Tous</option>
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>
  );
}

export default async function AdminSuiviPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requireAuthorizedAdmin();
  const params = await searchParams;
  const filters = normalizeCrmFilters(params);
  const { cases: allCases, error } = await getAdminClientPipelineCases(filters);
  const summary = buildSummary(allCases);
  const cases = filters.view === "a_traiter" ? sortActionableCases(allCases.filter(isActionableCase)) : allCases;

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
        <p className="text-sm font-bold uppercase tracking-[0.22em] text-emerald-700">CRM</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950">Suivi client</h1>
        <p className="mt-2 max-w-3xl text-slate-600">Vue centralisée des dossiers CRM issus de Contact, Consultation ou d’une création manuelle, sans exposer les données clients publiquement.</p>
        </div>
        <Link className="rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white shadow-sm" href="/admin/suivi/nouveau">Nouveau dossier</Link>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        <SummaryCard label="Nouveaux dossiers" value={summary.newCases} />
        <SummaryCard label="À traiter" value={summary.actionable} />
        <SummaryCard label="Actions en retard" value={summary.overdue} />
        <SummaryCard label="Propositions envoyées" value={summary.proposals} />
        <SummaryCard label="Dossiers gagnés" value={summary.won} />
        <SummaryCard label="Dossiers perdus" value={summary.lost} />
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link className={`rounded-xl px-5 py-2.5 text-sm font-bold ${filters.view === "a_traiter" ? "bg-emerald-700 text-white" : "bg-white text-slate-700 ring-1 ring-slate-200"}`} href="/admin/suivi?view=a_traiter">À traiter</Link>
        <Link className={`rounded-xl px-5 py-2.5 text-sm font-bold ${filters.view !== "a_traiter" ? "bg-emerald-700 text-white" : "bg-white text-slate-700 ring-1 ring-slate-200"}`} href="/admin/suivi">Tous les dossiers</Link>
      </div>

      <form className="mt-6 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200" action="/admin/suivi">
        <input type="hidden" name="view" value={filters.view ?? "all"} />
        <div className="grid gap-4 lg:grid-cols-[2fr_repeat(3,1fr)]">
          <label className="flex flex-col gap-1 text-xs font-bold uppercase tracking-wide text-slate-500">
            Recherche
            <input className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold normal-case tracking-normal text-slate-800" name="q" defaultValue={filters.search ?? ""} placeholder="Nom, téléphone, email, ID dossier" />
          </label>
          <SelectFilter name="status" label="Statut" value={filters.status} options={crmStatuses.map((value) => ({ value, label: statusLabels[value] }))} />
          <SelectFilter name="priority" label="Priorité" value={filters.priority} options={crmPriorities.map((value) => ({ value, label: priorityLabels[value] }))} />
          <SelectFilter name="source" label="Source" value={filters.source} options={crmSources.map((value) => ({ value, label: sourceLabels[value] }))} />
          <SelectFilter name="interest" label="Intérêt" value={filters.interest} options={crmInterestLevels.map((value) => ({ value, label: interestLabels[value] }))} />
          <SelectFilter name="outcome" label="Issue" value={filters.outcome} options={crmOutcomes.map((value) => ({ value, label: outcomeLabels[value] }))} />
        </div>
        <div className="mt-4 flex flex-wrap gap-3"><button className="rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-bold text-white" type="submit">Filtrer</button><Link className="rounded-xl bg-slate-100 px-5 py-2.5 text-sm font-bold text-slate-700" href="/admin/suivi">Réinitialiser</Link></div>
      </form>

      {error ? <p className="mt-6 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-800">Impossible de charger les dossiers CRM : {error}</p> : null}

      <div className="mt-6 overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <table className="w-full min-w-[1500px] text-left text-sm">
          <thead className="whitespace-nowrap bg-slate-100 text-slate-600"><tr>{["ID dossier", "Date 1er contact", "Nom client / Organisation", "Téléphone", "Email", "Type de projet", "Localisation", "Source", "Niveau intérêt", "Priorité", "Statut", "Prochaine action", "Responsable", "Date prochaine action", "Jours sans interaction", "Alertes suivi", "Issue"].map((header) => <th className="p-3" key={header}>{header}</th>)}</tr></thead>
          <tbody>{cases.map((item) => { const days = getDaysWithoutInteraction(item); const alerts = getAlertBadges(item, days); return <tr className="border-t border-slate-100 align-top" key={item.id}><td className="whitespace-nowrap p-3 font-bold text-emerald-900"><Link className="hover:underline" href={`/admin/suivi/${item.id}`}>{item.case_code}</Link></td><td className="whitespace-nowrap p-3">{formatDate(item.first_contact_at)}</td><td className="whitespace-nowrap p-3"><span className="font-semibold text-slate-950">{item.client_name}</span>{item.organization_name ? <span className="text-xs text-slate-500"> / {item.organization_name}</span> : null}</td><td className="whitespace-nowrap p-3">{item.phone ?? "—"}</td><td className="whitespace-nowrap p-3">{item.email ?? "—"}</td><td className="whitespace-nowrap p-3">{item.project_type ?? "—"}</td><td className="whitespace-nowrap p-3">{item.location ?? "—"}</td><td className="whitespace-nowrap p-3"><Badge kind="source" value={item.source_type}>{sourceLabels[item.source_type]}</Badge></td><td className="whitespace-nowrap p-3"><Badge kind="interest" value={item.interest_level}>{interestLabels[item.interest_level]}</Badge></td><td className="whitespace-nowrap p-3"><Badge kind="priority" value={item.priority}>{priorityLabels[item.priority]}</Badge></td><td className="whitespace-nowrap p-3"><Badge kind="status" value={item.status}>{statusLabels[item.status]}</Badge></td><td className="max-w-52 truncate whitespace-nowrap p-3" title={item.next_action ?? undefined}>{item.next_action ?? "—"}</td><td className="whitespace-nowrap p-3">{item.responsible ?? "—"}</td><td className="whitespace-nowrap p-3">{formatDate(item.next_action_at)}</td><td className="whitespace-nowrap p-3 font-semibold">{days ?? "—"}</td><td className="min-w-52 p-3"><div className="flex flex-wrap gap-1.5">{alerts.length ? alerts.map((alert) => <Badge key={alert} kind="alert" value={alert}>{alert}</Badge>) : <Badge kind="alert" value="RAS">RAS</Badge>}</div></td><td className="whitespace-nowrap p-3"><Badge kind="outcome" value={item.outcome}>{outcomeLabels[item.outcome]}</Badge></td></tr>; })}</tbody>
        </table>
        {cases.length === 0 ? <div className="p-8 text-center"><p className="font-semibold text-slate-700">Aucun dossier de suivi pour le moment.</p><p className="mt-2 text-slate-500">{filters.view === "a_traiter" ? "Aucun dossier ne nécessite une action prioritaire." : "Les demandes Contact et Consultation seront bientôt centralisées ici."}</p></div> : null}
      </div>
    </div>
  );
}
