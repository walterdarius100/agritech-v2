import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/server";
import type { CreateConsultationRequestInput } from "@/types/consultation";
import type { CreateContactRequestInput } from "@/types/contact";

type PipelineSourceType = "contact" | "consultation";

type SupabaseAdminClient = NonNullable<
  ReturnType<typeof createSupabaseAdminClient>
>;

type ContactPipelineSource = CreateContactRequestInput & {
  id: string;
  created_at: string;
};

type ConsultationPipelineSource = CreateConsultationRequestInput & {
  id: string;
  created_at: string;
  paid_at?: string | null;
  amount?: number | null;
  currency?: string | null;
  consultation_package?: string | null;
};

function getNextActionAt(from = new Date()) {
  const nextActionAt = new Date(from);
  nextActionAt.setDate(nextActionAt.getDate() + 1);
  return nextActionAt.toISOString();
}

function getLocation(department?: string | null, commune?: string | null) {
  return [commune, department].filter(Boolean).join(" / ") || null;
}

async function getExistingPipelineCaseId(
  supabase: SupabaseAdminClient,
  sourceType: PipelineSourceType,
  sourceId: string,
) {
  const { data, error } = await supabase
    .from("client_pipeline_cases")
    .select("id")
    .eq("source_type", sourceType)
    .eq("source_id", sourceId)
    .maybeSingle();

  if (error) throw error;
  return typeof data?.id === "string" ? data.id : null;
}


async function createPipelineInteraction(caseId: string, payload: Record<string, unknown>) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return;

  const { error } = await supabase.from("client_pipeline_interactions").insert({
    case_id: caseId,
    ...payload,
  });

  if (error) throw error;
}

async function insertPipelineCaseIfMissing(
  sourceType: PipelineSourceType,
  sourceId: string,
  payload: Record<string, unknown>,
) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    console.error("[crm-pipeline] Supabase admin config missing", {
      sourceType,
      sourceId,
    });
    return;
  }

  const existingId = await getExistingPipelineCaseId(
    supabase,
    sourceType,
    sourceId,
  );
  if (existingId) return null;

  const { data, error } = await supabase.from("client_pipeline_cases").insert(payload).select("id").single();

  if (error) {
    if (error.code === "23505") {
      console.info("[crm-pipeline] duplicate source ignored", {
        sourceType,
        sourceId,
      });
      return null;
    }

    throw error;
  }

  return typeof data?.id === "string" ? data.id : null;
}

export async function createPipelineCaseFromContact(
  contactRequest: ContactPipelineSource,
) {
  const caseId = await insertPipelineCaseIfMissing("contact", contactRequest.id, {
    source_type: "contact",
    source_id: contactRequest.id,
    source: "contact",
    first_contact_at: contactRequest.created_at,
    client_name: contactRequest.full_name,
    organization_name: contactRequest.organization,
    primary_contact: contactRequest.full_name,
    email: contactRequest.email,
    phone: contactRequest.phone,
    project_type: "Demande d’information générale",
    location: null,
    main_channel: "site_web",
    interest_level: "moyen",
    priority: "normale",
    status: "nouveau",
    next_action: "Répondre à la demande d’information",
    next_action_at: getNextActionAt(new Date(contactRequest.created_at)),
    outcome: "en_cours",
    last_interaction_at: contactRequest.created_at,
    metadata: {
      request_type: contactRequest.request_type,
      subject: contactRequest.subject,
      source_page: contactRequest.source_page,
      service_slug: contactRequest.service_slug,
      formation_slug: contactRequest.formation_slug,
      course_slug: contactRequest.course_slug,
      course_title: contactRequest.course_title,
    },
  });

  if (caseId) {
    await createPipelineInteraction(caseId, {
      interaction_type: "note",
      interaction_date: contactRequest.created_at,
      channel: "site_web",
      summary: "Dossier créé depuis Contact",
      details: contactRequest.subject ?? null,
      created_by: "system",
      metadata: { source_type: "contact", source_id: contactRequest.id },
    });
  }
}

export async function createPipelineCaseFromConsultation(
  consultationRequest: ConsultationPipelineSource,
) {
  const caseId = await insertPipelineCaseIfMissing("consultation", consultationRequest.id, {
    source_type: "consultation",
    source_id: consultationRequest.id,
    source: "consultation",
    first_contact_at: consultationRequest.created_at,
    client_name: consultationRequest.full_name,
    email: consultationRequest.email,
    phone: consultationRequest.phone,
    project_type: consultationRequest.consultation_type,
    location: getLocation(
      consultationRequest.department,
      consultationRequest.commune,
    ),
    main_channel: "site_web",
    interest_level: "eleve",
    priority: "haute",
    status: "a_qualifier",
    next_action: "Vérifier le paiement et planifier la consultation",
    next_action_at: getNextActionAt(new Date(consultationRequest.created_at)),
    outcome: "en_cours",
    last_interaction_at: consultationRequest.created_at,
    metadata: {
      project_stage: consultationRequest.project_stage,
      estimated_budget: consultationRequest.estimated_budget,
      consultation_mode: consultationRequest.consultation_mode,
      consultation_package: consultationRequest.consultation_package,
      amount: consultationRequest.amount,
      currency: consultationRequest.currency,
    },
  });

  if (caseId) {
    await createPipelineInteraction(caseId, {
      interaction_type: "note",
      interaction_date: consultationRequest.created_at,
      channel: "site_web",
      summary: "Dossier créé depuis Consultation",
      details: consultationRequest.consultation_type ?? null,
      created_by: "system",
      metadata: { source_type: "consultation", source_id: consultationRequest.id },
    });
  }
}

export async function markPipelineCaseConsultationPaid({
  consultationRequestId,
  paidAt,
}: {
  consultationRequestId: string;
  paidAt: string;
}) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    console.error("[crm-pipeline] Supabase admin config missing", {
      sourceType: "consultation",
      sourceId: consultationRequestId,
      paidAt,
    });
    return;
  }

  const { data: caseData } = await supabase
    .from("client_pipeline_cases")
    .select("id")
    .eq("source_type", "consultation")
    .eq("source_id", consultationRequestId)
    .maybeSingle();

  const { error } = await supabase
    .from("client_pipeline_cases")
    .update({
      status: "reunion_a_planifier",
      next_action: "Planifier la réunion de consultation",
      priority: "haute",
      last_interaction_at: paidAt,
      next_action_at: getNextActionAt(new Date(paidAt)),
    })
    .eq("source_type", "consultation")
    .eq("source_id", consultationRequestId);

  if (error) throw error;

  if (typeof caseData?.id === "string") {
    await createPipelineInteraction(caseData.id, {
      interaction_type: "paiement",
      interaction_date: paidAt,
      channel: "site_web",
      summary: "Consultation payée",
      created_by: "system",
      metadata: { source_type: "consultation", source_id: consultationRequestId },
    });
  }
}

export async function safeCreatePipelineCaseFromContact(
  contactRequest: ContactPipelineSource,
) {
  try {
    await createPipelineCaseFromContact(contactRequest);
  } catch (error) {
    console.error("[crm-pipeline] contact sync failed", {
      sourceType: "contact",
      sourceId: contactRequest.id,
      message: error instanceof Error ? error.message : "Unknown CRM sync error",
    });
  }
}

export async function safeCreatePipelineCaseFromConsultation(
  consultationRequest: ConsultationPipelineSource,
) {
  try {
    await createPipelineCaseFromConsultation(consultationRequest);
  } catch (error) {
    console.error("[crm-pipeline] consultation sync failed", {
      sourceType: "consultation",
      sourceId: consultationRequest.id,
      message: error instanceof Error ? error.message : "Unknown CRM sync error",
    });
  }
}

export async function safeMarkPipelineCaseConsultationPaid(input: {
  consultationRequestId: string;
  paidAt: string;
}) {
  try {
    await markPipelineCaseConsultationPaid(input);
  } catch (error) {
    console.error("[crm-pipeline] consultation paid sync failed", {
      sourceType: "consultation",
      sourceId: input.consultationRequestId,
      paidAt: input.paidAt,
      message: error instanceof Error ? error.message : "Unknown CRM sync error",
    });
  }
}
