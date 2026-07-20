import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/server";

export const emailEventTypes = [
  "consultation_client_confirmation",
  "consultation_internal_notification",
  "contact_visitor_acknowledgement",
  "contact_internal_notification",
  "academy_welcome",
  "academy_purchase_confirmation",
  "academy_internal_purchase_notification",
  "certificate_available",
] as const;

export const emailEventStatuses = ["sent", "failed", "skipped"] as const;

export type EmailEventType = (typeof emailEventTypes)[number];
export type EmailEventStatus = (typeof emailEventStatuses)[number];

export type EmailEventMetadata = Record<
  string,
  string | number | boolean | null
>;

export type RecordEmailEventInput = {
  eventType: EmailEventType;
  relatedEntityType?: string | null;
  relatedEntityId?: string | null;
  recipientEmail: string;
  recipientName?: string | null;
  subject: string;
  provider?: "brevo" | string;
  providerMessageId?: string | null;
  status: EmailEventStatus;
  errorMessage?: string | null;
  metadata?: EmailEventMetadata;
};

function sanitizeMetadata(metadata?: EmailEventMetadata) {
  if (!metadata) return {};

  return Object.fromEntries(
    Object.entries(metadata).filter(([key, value]) => {
      const normalizedKey = key.toLowerCase();
      if (
        normalizedKey.includes("token") ||
        normalizedKey.includes("password") ||
        normalizedKey.includes("api_key") ||
        normalizedKey.includes("secret")
      ) {
        return false;
      }

      return (
        ["string", "number", "boolean"].includes(typeof value) || value === null
      );
    }),
  );
}

export async function recordEmailEvent(input: RecordEmailEventInput) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    console.error("[email-events] Supabase admin client missing", {
      eventType: input.eventType,
    });
    return { ok: false as const, message: "Supabase admin client missing" };
  }

  const { error } = await supabase.from("email_events").insert({
    event_type: input.eventType,
    related_entity_type: input.relatedEntityType ?? null,
    related_entity_id: input.relatedEntityId ?? null,
    recipient_email: input.recipientEmail.trim().toLowerCase(),
    recipient_name: input.recipientName?.trim() || null,
    subject: input.subject,
    provider: input.provider ?? "brevo",
    provider_message_id: input.providerMessageId ?? null,
    status: input.status,
    error_message: input.errorMessage?.slice(0, 1000) ?? null,
    metadata: sanitizeMetadata(input.metadata),
  });

  if (error) {
    console.error("[email-events] unable to record email event", {
      eventType: input.eventType,
      status: input.status,
      message: error.message,
    });
    return { ok: false as const, message: error.message };
  }

  return { ok: true as const };
}
