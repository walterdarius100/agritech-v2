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
  "academy_access",
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
  let message = cleanMultiline(input.message, limits.message);
  const serviceSlug = clean(input.service_slug, limits.slug);
  const formationSlug = clean(input.formation_slug, limits.slug);
  const courseSlug = clean(input.course_slug, limits.slug);
  const courseTitle = clean(input.course_title, limits.subject);
  const sourcePage = clean(input.source_page, limits.source_page);

  if (!fullName) return { ok: false, message: "Le nom complet est requis." };
  if (!email || !emailPattern.test(email)) {
    return { ok: false, message: "Un email valide est requis." };
  }
  if (!contactRequestTypes.includes(requestType)) {
    return { ok: false, message: "Type de demande invalide." };
  }

  // Si service_slug et formation_slug arrivent ensemble, le service est prioritaire.
  const finalRequestType = serviceSlug
    ? "service"
    : courseSlug || requestType === "academy_access"
      ? "academy_access"
      : formationSlug
        ? "formation"
        : requestType;

  const academyCourseTitle = courseTitle || subject || "Formation sélectionnée non précisée";
  if (!message && (courseSlug || requestType === "academy_access")) {
    message = `Demande d’accès à la formation Academy : ${academyCourseTitle}. L’étudiant souhaite être contacté pour les modalités de paiement et l’activation manuelle de son accès.`;
  }
  if (!message) return { ok: false, message: "Le message est requis." };

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
      course_slug: finalRequestType === "academy_access" ? nullable(courseSlug || formationSlug) : null,
      course_title: finalRequestType === "academy_access" ? nullable(academyCourseTitle) : null,
      subject: finalRequestType === "academy_access" ? nullable(subject || academyCourseTitle || "Accès formation Academy") : nullable(subject),
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

  const serviceTitle = clean(input.service_title, limits.subject);

  const metadata = (() => {
    if (validated.payload.request_type === "academy_access") {
      return {
        request_type: "academy_access",
        course_slug: validated.payload.course_slug,
        course_title: validated.payload.course_title,
        origin: "academy_course_page",
      };
    }

    if (validated.payload.request_type === "service") {
      return {
        request_type: "service",
        service_slug: validated.payload.service_slug,
        service_title: serviceTitle || validated.payload.subject,
        origin: "service_page",
      };
    }

    if (validated.payload.request_type === "partnership") {
      return {
        request_type: "partnership",
        origin: "partnership_cta",
      };
    }

    return {};
  })();

  const payload = {
    ...validated.payload,
    metadata,
  };

  const { error } = await supabase.from("contact_requests").insert(payload);
  if (error) {
    console.error("Unable to create contact request", error.message);
    return { ok: false as const, message: "Impossible d’envoyer votre demande pour le moment." };
  }

  return { ok: true as const, message: "Votre demande a bien été envoyée." };
}
