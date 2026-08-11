"use server";

import { createSupabaseAdminClient } from "@/lib/supabase/server";

export type EventResourceLeadFormState = {
  ok?: boolean;
  message?: string;
  downloadUrl?: string;
  downloadLabel?: string;
  fileName?: string | null;
  fieldErrors?: Partial<
    Record<
      "full_name" | "phone" | "email" | "organization" | "interest_area",
      string
    >
  >;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const publicErrorMessage =
  "Impossible d’enregistrer votre demande pour le moment.";
const successMessage =
  "Merci. Vous pouvez maintenant télécharger votre ressource Agri-tech.";
const maxPayloadBytes = 4_096;
const limits = {
  full_name: 120,
  phone: 40,
  email: 254,
  organization: 180,
  interest_area: 180,
};

function readText(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function isTooLong(value: string, maxLength: number) {
  return new TextEncoder().encode(value).length > maxLength * 4;
}

function hasExcessivePayload(formData: FormData) {
  let payloadBytes = 0;

  for (const [name, value] of formData.entries()) {
    if (typeof value !== "string") return true;
    payloadBytes += new TextEncoder().encode(name).length;
    payloadBytes += new TextEncoder().encode(value).length;
    if (payloadBytes > maxPayloadBytes) return true;
  }

  return false;
}

function getSafeDownloadUrl(value: unknown) {
  if (typeof value !== "string") return null;
  const url = value.trim();
  if (url.startsWith("/") && !url.startsWith("//")) return url;

  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:"
      ? url
      : null;
  } catch {
    return null;
  }
}

export async function submitEventResourceLead(
  slug: string,
  _previousState: EventResourceLeadFormState,
  formData: FormData,
): Promise<EventResourceLeadFormState> {
  if (!slugPattern.test(slug)) return { message: publicErrorMessage };
  if (hasExcessivePayload(formData)) return { message: publicErrorMessage };

  const honeypot = readText(formData, "company_website");
  if (honeypot) {
    return { ok: true, message: successMessage };
  }

  const fullName = readText(formData, "full_name");
  const phone = readText(formData, "phone");
  const rawEmail = readText(formData, "email");
  const email = rawEmail.toLowerCase();
  const organization = readText(formData, "organization");
  const interestArea = readText(formData, "interest_area");

  const oversized =
    isTooLong(fullName, limits.full_name) ||
    isTooLong(phone, limits.phone) ||
    isTooLong(email, limits.email) ||
    isTooLong(organization, limits.organization) ||
    isTooLong(interestArea, limits.interest_area);

  if (oversized) return { message: publicErrorMessage };

  const fieldErrors: EventResourceLeadFormState["fieldErrors"] = {};
  if (!fullName) fieldErrors.full_name = "Veuillez entrer votre nom complet.";
  if (fullName.length > limits.full_name)
    fieldErrors.full_name = "Le nom est trop long.";
  if (!phone) fieldErrors.phone = "Veuillez entrer votre numéro WhatsApp.";
  if (phone.length > limits.phone)
    fieldErrors.phone = "Le numéro est trop long.";
  if (!email || !emailPattern.test(email) || email.length > limits.email) {
    fieldErrors.email = "Veuillez entrer une adresse email valide.";
  }
  if (organization.length > limits.organization) {
    fieldErrors.organization = "Le nom de l’organisation est trop long.";
  }
  if (interestArea.length > limits.interest_area) {
    fieldErrors.interest_area = "Le domaine d’intérêt est trop long.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { message: "Veuillez vérifier les champs indiqués.", fieldErrors };
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    console.error("[event-resources] Supabase admin configuration is missing");
    return { message: publicErrorMessage };
  }

  const { data: resource, error: resourceError } = await supabase
    .from("event_resources")
    .select("id,file_url,file_name,event_name,download_button_label")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (resourceError) {
    console.error("[event-resources] Unable to validate resource", {
      slug,
      message: resourceError.message,
    });
  }

  const downloadUrl = getSafeDownloadUrl(resource?.file_url);
  if (resourceError || !resource || !downloadUrl) {
    return { message: publicErrorMessage };
  }

  const { error: insertError } = await supabase
    .from("event_resource_leads")
    .insert({
      resource_id: resource.id,
      full_name: fullName,
      phone,
      email,
      organization: organization || null,
      interest_area: interestArea || null,
      consent_newsletter: formData.get("consent_newsletter") === "on",
      source: "qr_code",
      event_name: resource.event_name,
      page_path: `/r/${slug}`,
      metadata: {},
    });

  if (insertError && insertError.code !== "23505") {
    console.error("[event-resources] Unable to create lead", {
      resourceId: resource.id,
      code: insertError.code,
      message: insertError.message,
    });
    return { message: publicErrorMessage };
  }

  return {
    ok: true,
    message: successMessage,
    downloadUrl,
    downloadLabel: resource.download_button_label,
    fileName: resource.file_name,
  };
}
