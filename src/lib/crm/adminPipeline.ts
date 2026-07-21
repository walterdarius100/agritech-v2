import { requireAuthorizedAdmin } from "@/lib/auth/adminAuth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import type {
  ClientPipelineCase,
  CrmInterestLevel,
  CrmOutcome,
  CrmPriority,
  CrmSourceType,
  CrmStatus,
} from "@/types/crm";

export const crmStatuses: CrmStatus[] = [
  "nouveau",
  "a_qualifier",
  "reunion_a_planifier",
  "reunion_prevue",
  "proposition_a_preparer",
  "proposition_envoyee",
  "relance_1",
  "relance_2",
  "gagne",
  "perdu",
  "en_attente",
  "archive",
];

export const crmSources: CrmSourceType[] = ["contact", "consultation", "manual"];
export const crmPriorities: CrmPriority[] = ["basse", "normale", "haute", "urgente"];
export const crmInterestLevels: CrmInterestLevel[] = ["faible", "moyen", "eleve", "tres_eleve"];
export const crmOutcomes: CrmOutcome[] = ["en_cours", "gagne", "perdu", "abandonne", "non_qualifie"];

export type CrmPipelineFilters = {
  search?: string;
  status?: CrmStatus | "all";
  source?: CrmSourceType | "all";
  priority?: CrmPriority | "all";
  interest?: CrmInterestLevel | "all";
  outcome?: CrmOutcome | "all";
};

export function normalizeCrmFilters(params: Record<string, string | undefined>): CrmPipelineFilters {
  const status = crmStatuses.includes(params.status as CrmStatus) ? (params.status as CrmStatus) : "all";
  const source = crmSources.includes(params.source as CrmSourceType) ? (params.source as CrmSourceType) : "all";
  const priority = crmPriorities.includes(params.priority as CrmPriority) ? (params.priority as CrmPriority) : "all";
  const interest = crmInterestLevels.includes(params.interest as CrmInterestLevel) ? (params.interest as CrmInterestLevel) : "all";
  const outcome = crmOutcomes.includes(params.outcome as CrmOutcome) ? (params.outcome as CrmOutcome) : "all";

  return {
    search: params.q?.trim() || undefined,
    status,
    source,
    priority,
    interest,
    outcome,
  };
}

export async function getAdminClientPipelineCases(filters: CrmPipelineFilters) {
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return { cases: [] as ClientPipelineCase[], error: "Configuration Supabase admin indisponible." };
  }

  let query = supabase
    .from("client_pipeline_cases")
    .select(
      "id,case_code,source_type,source_id,first_contact_at,client_name,organization_name,primary_contact,phone,email,project_type,location,source,main_channel,interest_level,priority,status,next_action,responsible,meeting_date,meeting_time,meeting_confirmed,post_meeting_decision,proposal_sent_at,proposed_amount_usd,follow_up_1_at,follow_up_2_at,expected_close_at,expected_decision,last_interaction_at,alert_follow_up,outcome,next_action_at,admin_notes,metadata,created_at,updated_at",
    )
    .order("created_at", { ascending: false })
    .limit(100);

  if (filters.status && filters.status !== "all") query = query.eq("status", filters.status);
  if (filters.source && filters.source !== "all") query = query.eq("source_type", filters.source);
  if (filters.priority && filters.priority !== "all") query = query.eq("priority", filters.priority);
  if (filters.interest && filters.interest !== "all") query = query.eq("interest_level", filters.interest);
  if (filters.outcome && filters.outcome !== "all") query = query.eq("outcome", filters.outcome);

  if (filters.search) {
    const term = filters.search.replaceAll("%", "").replaceAll(",", " ");
    query = query.or(
      `case_code.ilike.%${term}%,client_name.ilike.%${term}%,organization_name.ilike.%${term}%,phone.ilike.%${term}%,email.ilike.%${term}%`,
    );
  }

  const { data, error } = await query;

  return {
    cases: (data ?? []) as ClientPipelineCase[],
    error: error?.message ?? null,
  };
}

export const crmStatusLabels: Record<CrmStatus, string> = {
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
};

export const crmSourceLabels: Record<CrmSourceType, string> = { contact: "Contact", consultation: "Consultation", manual: "Manuel" };
export const crmPriorityLabels: Record<CrmPriority, string> = { basse: "Basse", normale: "Normale", haute: "Haute", urgente: "Urgente" };
export const crmInterestLabels: Record<CrmInterestLevel, string> = { faible: "Faible", moyen: "Moyen", eleve: "Élevé", tres_eleve: "Très élevé" };
export const crmOutcomeLabels: Record<CrmOutcome, string> = { en_cours: "En cours", gagne: "Gagné", perdu: "Perdu", abandonne: "Abandonné", non_qualifie: "Non qualifié" };

export type ClientPipelineCaseFormState = { error?: string; success?: string };


const CLIENT_PIPELINE_CASE_COLUMNS =
  "id,case_code,source_type,source_id,first_contact_at,client_name,organization_name,primary_contact,phone,email,project_type,location,source,main_channel,interest_level,priority,status,next_action,responsible,meeting_date,meeting_time,meeting_confirmed,post_meeting_decision,proposal_sent_at,proposed_amount_usd,follow_up_1_at,follow_up_2_at,expected_close_at,expected_decision,last_interaction_at,alert_follow_up,outcome,next_action_at,admin_notes,metadata,created_at,updated_at";

function getAdminClientOrThrow() {
  const supabase = createSupabaseAdminClient();
  if (!supabase) throw new Error("Configuration Supabase admin manquante.");
  return supabase;
}

export async function getAdminClientPipelineCaseById(id: string) {
  await requireAuthorizedAdmin();
  const supabase = getAdminClientOrThrow();
  const { data, error } = await supabase
    .from("client_pipeline_cases")
    .select(CLIENT_PIPELINE_CASE_COLUMNS)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as ClientPipelineCase | null;
}
