"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAuthorizedAdmin } from "@/lib/auth/adminAuth";
import { crmInteractionChannels, crmInteractionTypes, crmInterestLevels, crmManualSources, crmOutcomes, crmPriorities, crmStatuses, type ClientPipelineCaseFormState } from "@/lib/crm/adminPipeline";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import type { CrmInteractionChannel, CrmInteractionType, CrmInterestLevel, CrmManualSource, CrmOutcome, CrmPriority, CrmStatus } from "@/types/crm";

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

export async function createManualClientPipelineCase(formData: FormData) {
  await requireAuthorizedAdmin();

  const client_name = optionalText(formData, "client_name", 240);
  const source = String(formData.get("source") ?? "") as CrmManualSource;
  const status = String(formData.get("status") ?? "nouveau") as CrmStatus;
  const priority = String(formData.get("priority") ?? "normale") as CrmPriority;
  const interest_level = String(formData.get("interest_level") ?? "moyen") as CrmInterestLevel;

  if (!client_name) throw new Error("Le nom client / organisation est obligatoire.");
  if (!crmManualSources.includes(source)) throw new Error("Source manuelle invalide.");
  if (!crmStatuses.includes(status)) throw new Error("Statut invalide.");
  if (!crmPriorities.includes(priority)) throw new Error("Priorité invalide.");
  if (!crmInterestLevels.includes(interest_level)) throw new Error("Niveau d’intérêt invalide.");

  const now = new Date().toISOString();
  const { data, error } = await getAdminClientOrThrow()
    .from("client_pipeline_cases")
    .insert({
      source_type: "manual",
      source_id: null,
      source,
      client_name,
      organization_name: optionalText(formData, "organization_name", 240),
      primary_contact: optionalText(formData, "primary_contact", 240),
      phone: optionalText(formData, "phone", 80),
      email: optionalText(formData, "email", 240),
      project_type: optionalText(formData, "project_type", 240),
      location: optionalText(formData, "location", 240),
      main_channel: optionalText(formData, "main_channel", 120),
      interest_level,
      priority,
      status,
      next_action: optionalText(formData, "next_action", 1000),
      responsible: optionalText(formData, "responsible", 160),
      next_action_at: optionalDate(formData, "next_action_at"),
      admin_notes: optionalText(formData, "admin_notes", 5000),
      outcome: "en_cours",
      first_contact_at: now,
      last_interaction_at: now,
      metadata: { created_by: "admin_manual_form" },
    })
    .select("id")
    .single();

  if (error || !data) throw new Error("Impossible de créer le dossier CRM pour le moment.");

  await getAdminClientOrThrow().from("client_pipeline_interactions").insert({
    case_id: data.id,
    interaction_type: "note",
    interaction_date: now,
    channel: source === "whatsapp" ? "whatsapp" : source === "facebook" ? "facebook" : source === "instagram" ? "instagram" : source === "appel" ? "telephone" : source === "email_direct" ? "email" : source === "terrain" ? "reunion_physique" : null,
    summary: "Dossier créé manuellement",
    created_by: "admin",
    metadata: { source_type: "manual", source },
  });

  revalidatePath("/admin/suivi");
  redirect(`/admin/suivi/${data.id}`);
}

export async function addAdminClientPipelineInteraction(caseId: string, _state: ClientPipelineCaseFormState, formData: FormData): Promise<ClientPipelineCaseFormState> {
  await requireAuthorizedAdmin();

  const interaction_type = String(formData.get("interaction_type") ?? "note") as CrmInteractionType;
  const rawChannel = optionalText(formData, "channel", 80) as CrmInteractionChannel | null;
  const summary = optionalText(formData, "summary", 500);
  const details = optionalText(formData, "details", 5000);
  const interaction_date = String(formData.get("interaction_date") ?? "").trim();
  const next_action = optionalText(formData, "next_action", 1000);
  const next_action_at = optionalDate(formData, "next_action_at");
  const status = optionalText(formData, "status", 80) as CrmStatus | null;

  if (!crmInteractionTypes.includes(interaction_type)) return { error: "Type d’interaction invalide." };
  if (rawChannel && !crmInteractionChannels.includes(rawChannel)) return { error: "Canal invalide." };
  if (!summary) return { error: "Le résumé de l’interaction est obligatoire." };
  if (status && !crmStatuses.includes(status)) return { error: "Statut invalide." };

  const parsedInteractionDate = interaction_date ? new Date(interaction_date) : new Date();
  if (Number.isNaN(parsedInteractionDate.getTime())) return { error: "Date d’interaction invalide." };

  const supabase = getAdminClientOrThrow();
  const timestamp = parsedInteractionDate.toISOString();
  const { error: insertError } = await supabase.from("client_pipeline_interactions").insert({
    case_id: caseId,
    interaction_type,
    interaction_date: timestamp,
    channel: rawChannel,
    summary,
    details,
    created_by: optionalText(formData, "created_by", 160),
  });

  if (insertError) return { error: "Impossible d’ajouter l’interaction pour le moment." };

  const caseUpdate: Record<string, unknown> = { last_interaction_at: timestamp };
  if (next_action) caseUpdate.next_action = next_action;
  if (next_action_at) caseUpdate.next_action_at = next_action_at;
  if (status) caseUpdate.status = status;

  const { error: updateError } = await supabase.from("client_pipeline_cases").update(caseUpdate).eq("id", caseId);
  if (updateError) return { error: "L’interaction a été ajoutée, mais le dossier principal n’a pas pu être mis à jour." };

  revalidatePath("/admin/suivi");
  revalidatePath(`/admin/suivi/${caseId}`);
  return { success: "Interaction ajoutée à l’historique du dossier." };
}
