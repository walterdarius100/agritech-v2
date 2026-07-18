import { revalidatePath } from "next/cache";

import { requireAuthorizedAdmin } from "@/lib/auth/adminAuth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { consultationRequestStatuses } from "@/lib/consultation/statusLabels";
import type {
  ConsultationPayment,
  ConsultationRequest,
  ConsultationRequestStatus,
} from "@/types/consultation";

const CONSULTATION_REQUEST_COLUMNS =
  "id,request_code,full_name,email,phone,department,commune,consultation_type,project_stage,project_description,estimated_budget,consultation_mode,consultation_package,amount,currency,payment_status,request_status,paid_at,scheduled_at,admin_notes,client_email_sent_at,internal_email_sent_at,client_email_message_id,internal_email_message_id,email_last_attempt_at,email_last_error,client_email_processing_at,internal_email_processing_at,created_at,updated_at";

const CONSULTATION_PAYMENT_COLUMNS =
  "id,consultation_request_id,provider,provider_transaction_id,amount,currency,status,payment_method,metadata,created_at,updated_at,paid_at";

export type ConsultationAdminFilter = "all" | ConsultationRequestStatus;

export type ConsultationRequestWithPayments = ConsultationRequest & {
  payments: ConsultationPayment[];
};

export type ConsultationAdminFormState = {
  error?: string;
  success?: string;
};

function getAdminClientOrThrow() {
  const supabase = createSupabaseAdminClient();
  if (!supabase) throw new Error("Configuration Supabase admin manquante.");
  return supabase;
}

export function normalizeConsultationFilter(value?: string | string[]) {
  const filter = Array.isArray(value) ? value[0] : value;
  if (!filter || filter === "all") return "all" as const;
  return consultationRequestStatuses.includes(
    filter as ConsultationRequestStatus,
  )
    ? (filter as ConsultationRequestStatus)
    : ("all" as const);
}

export async function getAdminConsultationRequests(
  filter: ConsultationAdminFilter = "all",
) {
  await requireAuthorizedAdmin();

  const supabase = getAdminClientOrThrow();
  let query = supabase
    .from("consultation_requests")
    .select(CONSULTATION_REQUEST_COLUMNS)
    .order("created_at", { ascending: false });

  if (filter !== "all") {
    query = query.eq("request_status", filter);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return (data ?? []) as ConsultationRequest[];
}

export async function getAdminConsultationRequestById(
  id: string,
): Promise<ConsultationRequestWithPayments | null> {
  await requireAuthorizedAdmin();

  const supabase = getAdminClientOrThrow();
  const { data: request, error: requestError } = await supabase
    .from("consultation_requests")
    .select(CONSULTATION_REQUEST_COLUMNS)
    .eq("id", id)
    .maybeSingle();

  if (requestError) throw new Error(requestError.message);
  if (!request) return null;

  const { data: payments, error: paymentsError } = await supabase
    .from("consultation_payments")
    .select(CONSULTATION_PAYMENT_COLUMNS)
    .eq("consultation_request_id", id)
    .order("created_at", { ascending: false });

  if (paymentsError) throw new Error(paymentsError.message);

  return {
    ...(request as ConsultationRequest),
    payments: (payments ?? []) as ConsultationPayment[],
  };
}

export async function updateAdminConsultationRequest(
  id: string,
  _state: ConsultationAdminFormState,
  formData: FormData,
): Promise<ConsultationAdminFormState> {
  "use server";

  await requireAuthorizedAdmin();

  const status = String(
    formData.get("request_status") ?? "",
  ) as ConsultationRequestStatus;
  const adminNotes =
    String(formData.get("admin_notes") ?? "")
      .trim()
      .slice(0, 5000) || null;

  if (!consultationRequestStatuses.includes(status)) {
    return { error: "Statut de demande invalide." };
  }

  const updatePayload: {
    request_status: ConsultationRequestStatus;
    admin_notes: string | null;
    scheduled_at?: string | null;
  } = {
    request_status: status,
    admin_notes: adminNotes,
  };

  if (status === "scheduled") {
    updatePayload.scheduled_at = new Date().toISOString();
  }

  if (status === "cancelled") {
    updatePayload.scheduled_at = null;
  }

  const supabase = getAdminClientOrThrow();
  const { error } = await supabase
    .from("consultation_requests")
    .update(updatePayload)
    .eq("id", id);

  if (error)
    return {
      error: "Impossible de mettre à jour la consultation pour le moment.",
    };

  revalidatePath("/admin/consultations");
  revalidatePath(`/admin/consultations/${id}`);
  return { success: "Demande de consultation mise à jour." };
}
