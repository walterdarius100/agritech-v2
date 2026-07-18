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

const CONSULTATION_REQUEST_COLUMNS =
  "id,request_code,full_name,email,phone,department,commune,consultation_type,project_stage,project_description,estimated_budget,consultation_mode,consultation_package,amount,currency,payment_status,request_status,paid_at,scheduled_at,admin_notes,client_email_sent_at,internal_email_sent_at,created_at,updated_at";

type ConsultationEmailResult = {
  clientEmail: "sent" | "skipped_no_email" | "skipped_already_sent" | "failed";
  internalEmail:
    "sent" | "skipped_missing_recipient" | "skipped_already_sent" | "failed";
};

function buildAdminUrl(requestId: string) {
  return `${env.siteUrl.replace(/\/$/, "")}/admin/consultations/${encodeURIComponent(requestId)}`;
}

function logConsultationEmailContext(request: ConsultationRequest) {
  console.info("[consultation-email] started", {
    requestId: request.id,
    request_code: request.request_code,
    requestFound: true,
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
    console.error("[consultation-email] marker update failure", {
      requestId,
      field,
      message: error.message,
    });
  } else {
    console.info("[consultation-email] marker update success", {
      requestId,
      field,
    });
  }
}

export async function sendConsultationPaidEmails(
  supabase: SupabaseAdminClient,
  requestOrId: ConsultationRequest | string,
): Promise<ConsultationEmailResult> {
  let request: ConsultationRequest | null = null;

  if (typeof requestOrId === "string") {
    const { data, error } = await supabase
      .from("consultation_requests")
      .select(CONSULTATION_REQUEST_COLUMNS)
      .eq("id", requestOrId)
      .maybeSingle();

    if (error) {
      console.error("[consultation-email] request load error", {
        requestId: requestOrId,
        message: error.message,
      });
    }

    request = (data as ConsultationRequest | null) ?? null;
    console.info("[consultation-email] request found", Boolean(request));
  } else {
    request = requestOrId;
    console.info("[consultation-email] request found", true);
  }

  if (!request) {
    return { clientEmail: "failed", internalEmail: "failed" };
  }

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

  console.info(
    "[consultation-email] should send client email",
    Boolean(request.email && !request.client_email_sent_at),
  );
  if (request.client_email_sent_at) {
    result.clientEmail = "skipped_already_sent";
  } else if (!request.email) {
    console.info(
      "[consultation-email] client email skipped: no client email provided",
      {
        requestId: request.id,
        request_code: request.request_code,
      },
    );
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
    });

    if (sendResult.ok) {
      console.info(
        "[consultation-email] client email Brevo success/messageId",
        {
          requestId: request.id,
          request_code: request.request_code,
          emailType: "client",
          messageId: sendResult.messageId,
        },
      );
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

  console.info(
    "[consultation-email] should send internal email",
    Boolean(notificationRecipient && !request.internal_email_sent_at),
  );
  if (request.internal_email_sent_at) {
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
    });

    if (sendResult.ok) {
      console.info(
        "[consultation-email] internal email Brevo success/messageId",
        {
          requestId: request.id,
          request_code: request.request_code,
          emailType: "internal",
          messageId: sendResult.messageId,
        },
      );
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
