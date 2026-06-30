"use server";

import { revalidatePath } from "next/cache";

import { requireAuthorizedAdmin } from "@/lib/auth/adminAuth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import {
  contactRequestPriorities,
  contactRequestStatuses,
} from "@/lib/contact/createContactRequest";
import type { ContactRequest, ContactRequestPriority, ContactRequestStatus } from "@/types/contact";

const CONTACT_REQUEST_COLUMNS =
  "id,full_name,email,phone,organization,request_type,service_slug,formation_slug,subject,message,source_page,status,priority,admin_notes,created_at,updated_at";

export type ContactRequestFormState = { error?: string; success?: string };

function getAdminClientOrThrow() {
  const supabase = createSupabaseAdminClient();
  if (!supabase) throw new Error("Configuration Supabase admin manquante.");
  return supabase;
}

export async function getAdminContactRequests() {
  await requireAuthorizedAdmin();
  const supabase = getAdminClientOrThrow();
  const { data, error } = await supabase
    .from("contact_requests")
    .select(CONTACT_REQUEST_COLUMNS)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as ContactRequest[];
}

export async function getAdminContactRequestById(id: string) {
  await requireAuthorizedAdmin();
  const supabase = getAdminClientOrThrow();
  const { data, error } = await supabase
    .from("contact_requests")
    .select(CONTACT_REQUEST_COLUMNS)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as ContactRequest | null;
}

export async function updateContactRequest(
  id: string,
  _state: ContactRequestFormState,
  formData: FormData,
): Promise<ContactRequestFormState> {
  await requireAuthorizedAdmin();

  const status = String(formData.get("status") ?? "") as ContactRequestStatus;
  const priority = String(formData.get("priority") ?? "") as ContactRequestPriority;
  const adminNotes = String(formData.get("admin_notes") ?? "").trim().slice(0, 5000) || null;

  if (!contactRequestStatuses.includes(status)) return { error: "Statut invalide." };
  if (!contactRequestPriorities.includes(priority)) return { error: "Priorité invalide." };

  const supabase = getAdminClientOrThrow();
  const { error } = await supabase
    .from("contact_requests")
    .update({ status, priority, admin_notes: adminNotes })
    .eq("id", id);

  if (error) return { error: "Impossible de mettre à jour la demande." };

  revalidatePath("/admin/contact-requests");
  revalidatePath(`/admin/contact-requests/${id}`);
  return { success: "Demande mise à jour." };
}
