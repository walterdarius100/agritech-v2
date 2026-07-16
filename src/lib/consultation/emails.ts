import "server-only";

import {
  getConsultationNotificationRecipient,
  getConsultationReplyTo,
} from "@/lib/email/config";
import { sendTransactionalEmail } from "@/lib/email/send-email";
import {
  consultationPaidClientEmailTemplate,
  consultationPaidInternalEmailTemplate,
} from "@/lib/email/templates/consultation-paid";
import { env } from "@/lib/env";
import type { createSupabaseAdminClient } from "@/lib/supabase/server";
import type { ConsultationRequest } from "@/types/consultation";

type SupabaseAdminClient = NonNullable<
  ReturnType<typeof createSupabaseAdminClient>
>;

type ConsultationEmailResult = {
  clientEmail: "sent" | "skipped_no_email" | "skipped_already_sent" | "failed";
  internalEmail:
    "sent" | "skipped_missing_recipient" | "skipped_already_sent" | "failed";
};

function buildAdminUrl(requestId: string) {
  return `${env.siteUrl.replace(/\/$/, "")}/admin/consultations/${encodeURIComponent(requestId)}`;
}

async function markConsultationEmailSent(
  supabase: SupabaseAdminClient,
  requestId: string,
  field: "client_email_sent_at" | "internal_email_sent_at",
) {
  const { error } = await supabase
    .from("consultation_requests")
    .update({ [field]: new Date().toISOString() })
    .eq("id", requestId);

  if (error) {
    console.error("[Consultation email] Unable to update email sent marker", {
      requestId,
      field,
      message: error.message,
    });
  }
}

export async function sendConsultationPaidEmails(
  supabase: SupabaseAdminClient,
  request: ConsultationRequest,
): Promise<ConsultationEmailResult> {
  const replyTo = getConsultationReplyTo();
  const notificationRecipient = getConsultationNotificationRecipient();
  const result: ConsultationEmailResult = {
    clientEmail: "failed",
    internalEmail: "failed",
  };

  if (request.client_email_sent_at) {
    result.clientEmail = "skipped_already_sent";
  } else if (!request.email) {
    console.info(
      "[Consultation email] Client email skipped: no client email provided.",
      {
        requestId: request.id,
        requestCode: request.request_code,
      },
    );
    result.clientEmail = "skipped_no_email";
  } else {
    const template = consultationPaidClientEmailTemplate({
      request,
      replyToEmail: replyTo?.email,
    });
    const sendResult = await sendTransactionalEmail({
      to: { email: request.email, name: request.full_name },
      subject: template.subject,
      html: template.html,
      text: template.text,
      replyTo,
    });

    if (sendResult.ok) {
      await markConsultationEmailSent(
        supabase,
        request.id,
        "client_email_sent_at",
      );
      result.clientEmail = "sent";
    } else {
      console.error("[Consultation email] Client email failed", {
        requestId: request.id,
        requestCode: request.request_code,
        reason: sendResult.reason,
        skipped: sendResult.skipped ?? false,
      });
      result.clientEmail = "failed";
    }
  }

  if (request.internal_email_sent_at) {
    result.internalEmail = "skipped_already_sent";
  } else if (!notificationRecipient) {
    console.error(
      "[Consultation email] Internal email skipped: notification recipient is missing.",
      {
        requestId: request.id,
        requestCode: request.request_code,
      },
    );
    result.internalEmail = "skipped_missing_recipient";
  } else {
    const template = consultationPaidInternalEmailTemplate({
      request,
      replyToEmail: replyTo?.email,
      adminUrl: buildAdminUrl(request.id),
    });
    const sendResult = await sendTransactionalEmail({
      to: notificationRecipient,
      subject: template.subject,
      html: template.html,
      text: template.text,
      replyTo,
    });

    if (sendResult.ok) {
      await markConsultationEmailSent(
        supabase,
        request.id,
        "internal_email_sent_at",
      );
      result.internalEmail = "sent";
    } else {
      console.error("[Consultation email] Internal email failed", {
        requestId: request.id,
        requestCode: request.request_code,
        reason: sendResult.reason,
        skipped: sendResult.skipped ?? false,
      });
      result.internalEmail = "failed";
    }
  }

  return result;
}
