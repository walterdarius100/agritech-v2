import { createSupabaseAdminClient } from "@/lib/supabase/server";
import type {
  ContactRequestPriority,
  ContactRequestStatus,
  ContactRequestType,
  CreateContactRequestInput,
} from "@/types/contact";

export const contactRequestTypes: ContactRequestType[] = [
  "general",
  "service",
  "formation",
  "partnership",
  "other",
];

export const contactRequestStatuses: ContactRequestStatus[] = [
  "new",
  "in_review",
  "contacted",
  "converted",
  "closed",
  "spam",
];

export const contactRequestPriorities: ContactRequestPriority[] = [
  "low",
  "normal",
  "high",
  "urgent",
];

export type ContactValidationResult =
  | { ok: true; payload: CreateContactRequestInput }
  | { ok: false; message: string; spam?: boolean };

const limits = {
  full_name: 120,
  email: 180,
  phone: 40,
  organization: 180,
  subject: 180,
  message: 3000,
  slug: 160,
  source_page: 300,
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clean(value: unknown, maxLength: number) {
  const text = typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
  return text.slice(0, maxLength);
}

function cleanMultiline(value: unknown, maxLength: number) {
  const text = typeof value === "string" ? value.trim() : "";
  return text.slice(0, maxLength);
}

function nullable(value: string) {
  return value.length > 0 ? value : null;
}

export function validateContactRequestInput(input: Record<string, unknown>): ContactValidationResult {
  if (clean(input.company_website, 300)) {
    return { ok: false, message: "Votre demande a bien été envoyée.", spam: true };
  }

  const requestType = clean(input.request_type, 40) as ContactRequestType;
  const fullName = clean(input.full_name, limits.full_name);
  const email = clean(input.email, limits.email).toLowerCase();
  const phone = clean(input.phone, limits.phone);
  const organization = clean(input.organization, limits.organization);
  const subject = clean(input.subject, limits.subject);
  const message = cleanMultiline(input.message, limits.message);
  const serviceSlug = clean(input.service_slug, limits.slug);
  const formationSlug = clean(input.formation_slug, limits.slug);
  const sourcePage = clean(input.source_page, limits.source_page);

  if (!fullName) return { ok: false, message: "Le nom complet est requis." };
  if (!email || !emailPattern.test(email)) {
    return { ok: false, message: "Un email valide est requis." };
  }
  if (!message) return { ok: false, message: "Le message est requis." };
  if (!contactRequestTypes.includes(requestType)) {
    return { ok: false, message: "Type de demande invalide." };
  }

  const finalRequestType = formationSlug
    ? "formation"
    : serviceSlug
      ? "service"
      : requestType;

  return {
    ok: true,
    payload: {
      full_name: fullName,
      email,
      phone: nullable(phone),
      organization: nullable(organization),
      request_type: finalRequestType,
      service_slug: finalRequestType === "service" ? nullable(serviceSlug) : null,
      formation_slug: finalRequestType === "formation" ? nullable(formationSlug) : null,
      subject: nullable(subject),
      message,
      source_page: nullable(sourcePage),
    },
  };
}

export async function createContactRequest(input: Record<string, unknown>) {
  const validated = validateContactRequestInput(input);
  if (!validated.ok) return validated;

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return { ok: false as const, message: "Configuration Supabase manquante." };
  }

  const { error } = await supabase.from("contact_requests").insert(validated.payload);
  if (error) {
    console.error("Unable to create contact request", error.message);
    return { ok: false as const, message: "Impossible d’envoyer votre demande pour le moment." };
  }

  return { ok: true as const, message: "Votre demande a bien été envoyée." };
}
