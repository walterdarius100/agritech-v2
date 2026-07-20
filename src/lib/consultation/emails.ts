import "server-only";

import {
  getConsultationNotificationRecipient,
  getConsultationReplyTo,
} from "@/lib/email/config";
import { recordEmailEvent } from "@/lib/email/events";
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

function logConsultationEmailContext(request: ConsultationRequest) {
  console.info("[consultation-email] workflow started", {
    requestId: request.id,
    request_code: request.request_code,
    clientEmailPresent: Boolean(request.email),
    payment_status: request.payment_status,
    request_status: request.request_status,
    clientEmailSentAtPresent: Boolean(request.client_email_sent_at),
    internalEmailSentAtPresent: Boolean(request.internal_email_sent_at),
  });
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
    console.error("[consultation-email] unable to update email sent marker", {
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
  logConsultationEmailContext(request);

  const replyTo = getConsultationReplyTo();
  const notificationRecipient = getConsultationNotificationRecipient();
  const result: ConsultationEmailResult = {
    clientEmail: "failed",
    internalEmail: "failed",
  };

  if (request.payment_status !== "paid" || request.request_status !== "paid") {
    console.info("[consultation-email] skipped: request is not paid", {
      requestId: request.id,
      request_code: request.request_code,
      payment_status: request.payment_status,
      request_status: request.request_status,
    });
    return result;
  }

  if (request.client_email_sent_at) {
    await recordEmailEvent({
      eventType: "consultation_client_confirmation",
      relatedEntityType: "consultation_request",
      relatedEntityId: request.id,
      recipientEmail: request.email || "unknown@invalid.local",
      recipientName: request.full_name,
      subject: "Confirmation de consultation déjà envoyée",
      status: "skipped",
      errorMessage: "client_email_sent_at already present",
      metadata: { module: "consultation", request_code: request.request_code },
    });
    result.clientEmail = "skipped_already_sent";
  } else if (!request.email) {
    console.info(
      "[consultation-email] client email skipped: no client email provided",
      {
        requestId: request.id,
        request_code: request.request_code,
      },
    );
    await recordEmailEvent({
      eventType: "consultation_client_confirmation",
      relatedEntityType: "consultation_request",
      relatedEntityId: request.id,
      recipientEmail: "unknown@invalid.local",
      recipientName: request.full_name,
      subject: "Confirmation de consultation",
      status: "skipped",
      errorMessage: "client email missing",
      metadata: { module: "consultation", request_code: request.request_code },
    });
    result.clientEmail = "skipped_no_email";
  } else {
    console.info("[consultation-email] sending client email", {
      requestId: request.id,
      request_code: request.request_code,
    });
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
      emailEvent: {
        eventType: "consultation_client_confirmation",
        relatedEntityType: "consultation_request",
        relatedEntityId: request.id,
        recipientName: request.full_name,
        metadata: {
          module: "consultation",
          request_code: request.request_code,
        },
      },
    });

    if (sendResult.ok) {
      console.info("[consultation-email] Brevo success", {
        requestId: request.id,
        request_code: request.request_code,
        emailType: "client",
        messageId: sendResult.messageId,
      });
      await markConsultationEmailSent(
        supabase,
        request.id,
        "client_email_sent_at",
      );
      result.clientEmail = "sent";
    } else {
      console.error("[consultation-email] Brevo error", {
        requestId: request.id,
        request_code: request.request_code,
        emailType: "client",
        reason: sendResult.reason,
        status: sendResult.status,
        code: sendResult.code,
        message: sendResult.message,
        skipped: sendResult.skipped ?? false,
      });
      result.clientEmail = "failed";
    }
  }

  if (request.internal_email_sent_at) {
    await recordEmailEvent({
      eventType: "consultation_internal_notification",
      relatedEntityType: "consultation_request",
      relatedEntityId: request.id,
      recipientEmail: notificationRecipient?.email || "unknown@invalid.local",
      recipientName: notificationRecipient?.name,
      subject: "Notification interne consultation déjà envoyée",
      status: "skipped",
      errorMessage: "internal_email_sent_at already present",
      metadata: { module: "consultation", request_code: request.request_code },
    });
    result.internalEmail = "skipped_already_sent";
  } else if (!notificationRecipient) {
    console.error(
      "[consultation-email] internal email skipped: notification recipient is missing",
      {
        requestId: request.id,
        request_code: request.request_code,
        expectedVariable: "CONSULTATION_NOTIFICATION_EMAIL",
      },
    );
    await recordEmailEvent({
      eventType: "consultation_internal_notification",
      relatedEntityType: "consultation_request",
      relatedEntityId: request.id,
      recipientEmail: "unknown@invalid.local",
      subject: "Notification interne consultation",
      status: "skipped",
      errorMessage: "CONSULTATION_NOTIFICATION_EMAIL missing",
      metadata: { module: "consultation", request_code: request.request_code },
    });
    result.internalEmail = "skipped_missing_recipient";
  } else {
    console.info("[consultation-email] sending internal email", {
      requestId: request.id,
      request_code: request.request_code,
    });
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
      emailEvent: {
        eventType: "consultation_internal_notification",
        relatedEntityType: "consultation_request",
        relatedEntityId: request.id,
        recipientName: notificationRecipient.name,
        metadata: {
          module: "consultation",
          request_code: request.request_code,
        },
      },
    });

    if (sendResult.ok) {
      console.info("[consultation-email] Brevo success", {
        requestId: request.id,
        request_code: request.request_code,
        emailType: "internal",
        messageId: sendResult.messageId,
      });
      await markConsultationEmailSent(
        supabase,
        request.id,
        "internal_email_sent_at",
      );
      result.internalEmail = "sent";
    } else {
      console.error("[consultation-email] Brevo error", {
        requestId: request.id,
        request_code: request.request_code,
        emailType: "internal",
        reason: sendResult.reason,
        status: sendResult.status,
        code: sendResult.code,
        message: sendResult.message,
        skipped: sendResult.skipped ?? false,
      });
      result.internalEmail = "failed";
    }
  }

  return result;
}
