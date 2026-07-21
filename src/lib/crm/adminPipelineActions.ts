"use server";

import { revalidatePath } from "next/cache";

import { requireAuthorizedAdmin } from "@/lib/auth/adminAuth";
import { crmInterestLevels, crmOutcomes, crmPriorities, crmStatuses, type ClientPipelineCaseFormState } from "@/lib/crm/adminPipeline";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import type { CrmInterestLevel, CrmOutcome, CrmPriority, CrmStatus } from "@/types/crm";

function optionalText(formData: FormData, key: string, max = 1000) { return String(formData.get(key) ?? "").trim().slice(0, max) || null; }
function optionalDate(formData: FormData, key: string) { const value = String(formData.get(key) ?? "").trim(); return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null; }
function getAdminClientOrThrow() { const supabase = createSupabaseAdminClient(); if (!supabase) throw new Error("Configuration Supabase admin manquante."); return supabase; }

export async function updateAdminClientPipelineCase(id: string, _state: ClientPipelineCaseFormState, formData: FormData): Promise<ClientPipelineCaseFormState> {
  await requireAuthorizedAdmin();

  const interest_level = String(formData.get("interest_level") ?? "") as CrmInterestLevel;
  const priority = String(formData.get("priority") ?? "") as CrmPriority;
  const status = String(formData.get("status") ?? "") as CrmStatus;
  const outcome = String(formData.get("outcome") ?? "") as CrmOutcome;

  if (!crmInterestLevels.includes(interest_level)) return { error: "Niveau d’intérêt invalide." };
  if (!crmPriorities.includes(priority)) return { error: "Priorité invalide." };
  if (!crmStatuses.includes(status)) return { error: "Statut invalide." };
  if (!crmOutcomes.includes(outcome)) return { error: "Issue invalide." };

  const rawAmount = optionalText(formData, "proposed_amount_usd", 40);
  const proposed_amount_usd = rawAmount ? Number(rawAmount) : null;
  if (proposed_amount_usd !== null && !Number.isFinite(proposed_amount_usd)) return { error: "Montant proposé USD invalide." };

  const { error } = await getAdminClientOrThrow().from("client_pipeline_cases").update({
    client_name: optionalText(formData, "client_name", 240) ?? "Client sans nom",
    organization_name: optionalText(formData, "organization_name", 240),
    primary_contact: optionalText(formData, "primary_contact", 240),
    phone: optionalText(formData, "phone", 80),
    email: optionalText(formData, "email", 240),
    project_type: optionalText(formData, "project_type", 240),
    location: optionalText(formData, "location", 240),
    main_channel: optionalText(formData, "main_channel", 120),
    interest_level, priority, status,
    next_action: optionalText(formData, "next_action", 1000),
    responsible: optionalText(formData, "responsible", 160),
    meeting_date: optionalDate(formData, "meeting_date"),
    meeting_time: optionalText(formData, "meeting_time", 10),
    meeting_confirmed: formData.get("meeting_confirmed") === "on",
    post_meeting_decision: optionalText(formData, "post_meeting_decision", 1000),
    proposal_sent_at: optionalDate(formData, "proposal_sent_at"),
    proposed_amount_usd,
    follow_up_1_at: optionalDate(formData, "follow_up_1_at"),
    follow_up_2_at: optionalDate(formData, "follow_up_2_at"),
    expected_close_at: optionalDate(formData, "expected_close_at"),
    expected_decision: optionalText(formData, "expected_decision", 1000),
    outcome,
    next_action_at: optionalDate(formData, "next_action_at"),
    admin_notes: optionalText(formData, "admin_notes", 5000),
    last_interaction_at: new Date().toISOString(),
  }).eq("id", id);

  if (error) return { error: "Impossible d’enregistrer le dossier CRM pour le moment." };
  revalidatePath("/admin/suivi");
  revalidatePath(`/admin/suivi/${id}`);
  return { success: "Dossier CRM enregistré. Les modifications sont visibles ci-dessous." };
}
