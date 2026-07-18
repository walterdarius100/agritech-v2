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
    | "sent"
    | "skipped_missing_recipient"
    | "skipped_already_sent"
    | "failed";
};

function buildAdminUrl(requestId: string) {
  return `${env.siteUrl.replace(/\/$/, "")}/admin/consultations/${encodeURIComponent(requestId)}`;
}

function getConfiguredFromEmail() {
  return process.env.EMAIL_FROM_ADDRESS?.trim().toLowerCase() || null;
}

function getConfiguredEmailRuntime() {
  return {
    brevoApiKeyPresent: Boolean(process.env.BREVO_API_KEY?.trim()),
    emailFromNameUsed: process.env.EMAIL_FROM_NAME?.trim() || "Agri-tech",
    emailFromAddressUsed: getConfiguredFromEmail(),
    emailReplyToUsed: process.env.EMAIL_REPLY_TO?.trim().toLowerCase() || null,
    consultationReplyToEmailUsed:
      process.env.CONSULTATION_REPLY_TO_EMAIL?.trim().toLowerCase() || null,
    consultationNotificationEmailUsed:
      process.env.CONSULTATION_NOTIFICATION_EMAIL?.trim().toLowerCase() || null,
  };
}

function logConsultationEmailContext(
  request: ConsultationRequest,
  replyTo: ReturnType<typeof getConsultationReplyTo>,
  notificationRecipient: ReturnType<typeof getConsultationNotificationRecipient>,
) {
  const shouldSendClientEmail = Boolean(
    request.email && !request.client_email_sent_at,
  );
  const shouldSendInternalEmail = Boolean(
    notificationRecipient && !request.internal_email_sent_at,
  );

  console.info("[consultation-email] sendConsultationPaidEmails started", {
    requestId: request.id,
    request_code: request.request_code,
    ...getConfiguredEmailRuntime(),
  });

  console.info("[consultation-email] request loaded", {
    requestId: request.id,
    request_code: request.request_code,
    clientEmailPresent: Boolean(request.email),
    notificationEmailUsed: notificationRecipient?.email ?? null,
    replyToUsed: replyTo?.email ?? null,
    fromEmailUsed: getConfiguredFromEmail(),
    payment_status: request.payment_status,
    request_status: request.request_status,
    clientEmailSentAtPresent: Boolean(request.client_email_sent_at),
    internalEmailSentAtPresent: Boolean(request.internal_email_sent_at),
    shouldSendClientEmail,
    shouldSendInternalEmail,
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
    return false;
  }

  console.info("[consultation-email] marker update success", {
    requestId,
    field,
  });
  return true;
}

export async function sendConsultationPaidEmails(
  supabase: SupabaseAdminClient,
  request: ConsultationRequest,
): Promise<ConsultationEmailResult> {
  const replyTo = getConsultationReplyTo();
  const notificationRecipient = getConsultationNotificationRecipient();
  logConsultationEmailContext(request, replyTo, notificationRecipient);

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
    console.info("[consultation-email] client email skipped: already sent", {
      requestId: request.id,
      request_code: request.request_code,
      shouldSendClientEmail: false,
    });
    result.clientEmail = "skipped_already_sent";
  } else if (!request.email) {
    console.info("[consultation-email] client email skipped: no client email provided", {
      requestId: request.id,
      request_code: request.request_code,
      shouldSendClientEmail: false,
    });
    result.clientEmail = "skipped_no_email";
  } else {
    console.info("[consultation-email] sending client email", {
      requestId: request.id,
      request_code: request.request_code,
      to: request.email,
      replyToUsed: replyTo?.email ?? null,
      fromEmailUsed: getConfiguredFromEmail(),
      shouldSendClientEmail: true,
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
    });

    if (sendResult.ok) {
      console.info("[consultation-email] client email Brevo success", {
        requestId: request.id,
        request_code: request.request_code,
        messageId: sendResult.messageId,
      });
      await markConsultationEmailSent(
        supabase,
        request.id,
        "client_email_sent_at",
      );
      result.clientEmail = "sent";
    } else {
      console.error("[consultation-email] client email Brevo error", {
        requestId: request.id,
        request_code: request.request_code,
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
    console.info("[consultation-email] internal email skipped: already sent", {
      requestId: request.id,
      request_code: request.request_code,
      shouldSendInternalEmail: false,
    });
    result.internalEmail = "skipped_already_sent";
  } else if (!notificationRecipient) {
    console.error("[consultation-email] internal email skipped: notification recipient is missing", {
      requestId: request.id,
      request_code: request.request_code,
      expectedVariable: "CONSULTATION_NOTIFICATION_EMAIL",
      shouldSendInternalEmail: false,
    });
    result.internalEmail = "skipped_missing_recipient";
  } else {
    console.info("[consultation-email] sending internal email", {
      requestId: request.id,
      request_code: request.request_code,
      to: notificationRecipient.email,
      notificationEmailUsed: notificationRecipient.email,
      replyToUsed: replyTo?.email ?? null,
      fromEmailUsed: getConfiguredFromEmail(),
      shouldSendInternalEmail: true,
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
    });

    if (sendResult.ok) {
      console.info("[consultation-email] internal email Brevo success", {
        requestId: request.id,
        request_code: request.request_code,
        messageId: sendResult.messageId,
      });
      await markConsultationEmailSent(
        supabase,
        request.id,
        "internal_email_sent_at",
      );
      result.internalEmail = "sent";
    } else {
      console.error("[consultation-email] internal email Brevo error", {
        requestId: request.id,
        request_code: request.request_code,
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
