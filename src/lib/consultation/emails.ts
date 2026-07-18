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
import type {
  ConsultationPayment,
  ConsultationRequest,
} from "@/types/consultation";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type SupabaseAdminClient = NonNullable<
  ReturnType<typeof createSupabaseAdminClient>
>;

const CONSULTATION_REQUEST_COLUMNS =
  "id,request_code,full_name,email,phone,department,commune,consultation_type,project_stage,project_description,estimated_budget,consultation_mode,consultation_package,amount,currency,payment_status,request_status,paid_at,scheduled_at,admin_notes,client_email_sent_at,internal_email_sent_at,client_email_message_id,internal_email_message_id,email_last_attempt_at,email_last_error,client_email_last_error,internal_email_last_error,client_email_processing_at,internal_email_processing_at,created_at,updated_at";

const CONSULTATION_PAYMENT_COLUMNS =
  "id,consultation_request_id,provider,provider_transaction_id,amount,currency,status,payment_method,metadata,created_at,updated_at,paid_at";

type ConsultationEmailStatus =
  | "sent"
  | "skipped_no_email"
  | "skipped_invalid_email"
  | "skipped_missing_recipient"
  | "skipped_already_sent"
  | "skipped_locked"
  | "skipped_not_paid"
  | "failed";

type ConsultationEmailResult = {
  requestId: string;
  paymentId?: string;
  clientEmail: ConsultationEmailStatus;
  internalEmail: ConsultationEmailStatus;
};

type EmailKind = "client" | "internal";

type PaidConsultationContext = {
  request: ConsultationRequest;
  payment: ConsultationPayment | null;
};

function buildAdminUrl(requestId: string) {
  return `${env.siteUrl.replace(/\/$/, "")}/admin/consultations/${encodeURIComponent(requestId)}`;
}

function getPaymentId(payment: ConsultationPayment | null) {
  return payment?.provider_transaction_id || payment?.id;
}

function isValidEmail(email: string | null) {
  return Boolean(email && emailPattern.test(email.trim().toLowerCase()));
}

function truncateLogValue(value: string, maxLength = 1000) {
  return value.length > maxLength ? `${value.slice(0, maxLength)}…` : value;
}

function buildCombinedEmailLastError(input: {
  client: string | null;
  internal: string | null;
}) {
  if (!input.client && !input.internal) return null;

  return truncateLogValue(
    JSON.stringify({
      client: input.client,
      internal: input.internal,
    }),
  );
}

async function getCurrentEmailErrors(
  supabase: SupabaseAdminClient,
  requestId: string,
) {
  const { data, error } = await supabase
    .from("consultation_requests")
    .select("client_email_last_error,internal_email_last_error")
    .eq("id", requestId)
    .maybeSingle();

  if (error) {
    console.error("[consultation-email] unable to load current email errors", {
      step: "load_current_email_errors",
      requestId,
      supabaseMessage: error.message,
    });
  }

  return {
    client:
      (data?.client_email_last_error as string | null | undefined) ?? null,
    internal:
      (data?.internal_email_last_error as string | null | undefined) ?? null,
  };
}

function logConsultationEmailContext({
  request,
  payment,
}: PaidConsultationContext) {
  console.info("[consultation-email] started", {
    requestId: request.id,
    requestCode: request.request_code,
    requestFound: true,
    paymentId: getPaymentId(payment),
    paymentProvider: payment?.provider,
    providerTransactionIdPresent: Boolean(payment?.provider_transaction_id),
    clientEmailPresent: Boolean(request.email),
    clientEmailValid: isValidEmail(request.email),
    payment_status: request.payment_status,
    request_status: request.request_status,
    paymentRowStatus: payment?.status,
    paid_at: request.paid_at,
    paymentPaidAt: payment?.paid_at,
    clientEmailSentAtPresent: Boolean(request.client_email_sent_at),
    internalEmailSentAtPresent: Boolean(request.internal_email_sent_at),
    processedAt: new Date().toISOString(),
  });
}

async function loadPaidConsultationContext(
  supabase: SupabaseAdminClient,
  requestId: string,
): Promise<PaidConsultationContext | null> {
  const { data: request, error: requestError } = await supabase
    .from("consultation_requests")
    .select(CONSULTATION_REQUEST_COLUMNS)
    .eq("id", requestId)
    .maybeSingle();

  if (requestError) {
    console.error("[consultation-email] request query failed", {
      step: "load_request",
      requestId,
      supabaseMessage: requestError.message,
    });
    throw new Error(
      `Supabase consultation request query failed: ${requestError.message}`,
    );
  }

  console.info("[consultation-email] request found", Boolean(request));
  if (!request) return null;

  const { data: payment, error: paymentError } = await supabase
    .from("consultation_payments")
    .select(CONSULTATION_PAYMENT_COLUMNS)
    .eq("consultation_request_id", requestId)
    .eq("status", "paid")
    .order("paid_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (paymentError) {
    console.error("[consultation-email] payment query failed", {
      step: "load_paid_payment",
      requestId,
      supabaseMessage: paymentError.message,
    });
    throw new Error(
      `Supabase consultation payment query failed: ${paymentError.message}`,
    );
  }

  return {
    request: request as ConsultationRequest,
    payment: (payment as ConsultationPayment | null) ?? null,
  };
}

async function claimEmailSend(
  supabase: SupabaseAdminClient,
  requestId: string,
  emailKind: EmailKind,
) {
  const now = new Date();
  const nowIso = now.toISOString();
  const staleProcessingIso = new Date(
    now.getTime() - 10 * 60 * 1000,
  ).toISOString();
  const sentField =
    emailKind === "client" ? "client_email_sent_at" : "internal_email_sent_at";
  const processingField =
    emailKind === "client"
      ? "client_email_processing_at"
      : "internal_email_processing_at";

  const { data, error } = await supabase
    .from("consultation_requests")
    .update({
      [processingField]: nowIso,
      email_last_attempt_at: nowIso,
    })
    .eq("id", requestId)
    .is(sentField, null)
    .or(
      `${processingField}.is.null,${processingField}.lt.${staleProcessingIso}`,
    )
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("[consultation-email] claim failed", {
      step: "claim_email_send",
      emailType: emailKind,
      requestId,
      supabaseMessage: error.message,
    });
    throw new Error(`Supabase email claim failed: ${error.message}`);
  }

  const claimed = Boolean(data?.id);
  console.info("[consultation-email] claim result", {
    emailType: emailKind,
    requestId,
    claimed,
  });

  return claimed;
}

async function markConsultationEmailSent({
  supabase,
  requestId,
  emailKind,
  messageId,
}: {
  supabase: SupabaseAdminClient;
  requestId: string;
  emailKind: EmailKind;
  messageId: string;
}) {
  const sentField =
    emailKind === "client" ? "client_email_sent_at" : "internal_email_sent_at";
  const messageIdField =
    emailKind === "client"
      ? "client_email_message_id"
      : "internal_email_message_id";
  const processingField =
    emailKind === "client"
      ? "client_email_processing_at"
      : "internal_email_processing_at";

  const lastErrorField =
    emailKind === "client"
      ? "client_email_last_error"
      : "internal_email_last_error";
  const currentErrors = await getCurrentEmailErrors(supabase, requestId);
  const combinedEmailLastError = buildCombinedEmailLastError({
    client: emailKind === "client" ? null : currentErrors.client,
    internal: emailKind === "internal" ? null : currentErrors.internal,
  });

  const { error } = await supabase
    .from("consultation_requests")
    .update({
      [sentField]: new Date().toISOString(),
      [messageIdField]: messageId,
      [processingField]: null,
      [lastErrorField]: null,
      email_last_error: combinedEmailLastError,
    })
    .eq("id", requestId);

  if (error) {
    console.error("[consultation-email] marker update failure", {
      step: "mark_email_sent",
      emailType: emailKind,
      requestId,
      messageId,
      supabaseMessage: error.message,
    });
    throw new Error(`Supabase email marker update failed: ${error.message}`);
  }

  console.info("[consultation-email] marker update success", {
    emailType: emailKind,
    requestId,
    messageId,
  });
}

async function recordEmailFailure({
  supabase,
  requestId,
  emailKind,
  message,
}: {
  supabase: SupabaseAdminClient;
  requestId: string;
  emailKind: EmailKind;
  message: string;
}) {
  const processingField =
    emailKind === "client"
      ? "client_email_processing_at"
      : "internal_email_processing_at";
  const lastErrorField =
    emailKind === "client"
      ? "client_email_last_error"
      : "internal_email_last_error";
  const normalizedError = truncateLogValue(
    JSON.stringify({
      step: "send_consultation_paid_email",
      emailType: emailKind,
      message,
    }),
  );
  const currentErrors = await getCurrentEmailErrors(supabase, requestId);
  const combinedEmailLastError = buildCombinedEmailLastError({
    client: emailKind === "client" ? normalizedError : currentErrors.client,
    internal:
      emailKind === "internal" ? normalizedError : currentErrors.internal,
  });

  const { error } = await supabase
    .from("consultation_requests")
    .update({
      [processingField]: null,
      [lastErrorField]: normalizedError,
      email_last_attempt_at: new Date().toISOString(),
      email_last_error: combinedEmailLastError,
    })
    .eq("id", requestId);

  if (error) {
    console.error("[consultation-email] failure marker update failure", {
      step: "record_email_failure",
      emailType: emailKind,
      requestId,
      supabaseMessage: error.message,
    });
  }
}

function isPaidContext({ request, payment }: PaidConsultationContext) {
  return (
    request.payment_status === "paid" &&
    request.request_status === "paid" &&
    Boolean(request.paid_at) &&
    Boolean(payment) &&
    payment?.status === "paid" &&
    Boolean(payment.paid_at)
  );
}

export async function sendConsultationPaidEmails(
  supabase: SupabaseAdminClient,
  requestOrId: ConsultationRequest | string,
): Promise<ConsultationEmailResult> {
  const context =
    typeof requestOrId === "string"
      ? await loadPaidConsultationContext(supabase, requestOrId)
      : { request: requestOrId, payment: null };

  if (!context) {
    return {
      requestId: typeof requestOrId === "string" ? requestOrId : requestOrId.id,
      clientEmail: "failed",
      internalEmail: "failed",
    };
  }

  const { request, payment } = context;
  const paymentId = getPaymentId(payment);
  const result: ConsultationEmailResult = {
    requestId: request.id,
    paymentId,
    clientEmail: "failed",
    internalEmail: "failed",
  };

  logConsultationEmailContext(context);

  if (!isPaidContext(context)) {
    console.warn(
      "[consultation-email] skipped: payment is not fully confirmed",
      {
        step: "validate_paid_context",
        requestId: request.id,
        requestCode: request.request_code,
        paymentId,
        payment_status: request.payment_status,
        request_status: request.request_status,
        paid_at: request.paid_at,
        paymentFound: Boolean(payment),
        paymentStatus: payment?.status,
        paymentPaidAt: payment?.paid_at,
      },
    );
    return {
      ...result,
      clientEmail: "skipped_not_paid",
      internalEmail: "skipped_not_paid",
    };
  }

  const replyTo = getConsultationReplyTo();
  const notificationRecipient = getConsultationNotificationRecipient();

  console.info(
    "[consultation-email] should send client email",
    Boolean(request.email && !request.client_email_sent_at),
  );
  if (request.client_email_sent_at) {
    result.clientEmail = "skipped_already_sent";
  } else if (!request.email) {
    console.error("[consultation-email] client email missing", {
      step: "validate_client_email",
      emailType: "client",
      requestId: request.id,
      paymentId,
    });
    result.clientEmail = "skipped_no_email";
  } else if (!isValidEmail(request.email)) {
    console.error("[consultation-email] client email invalid", {
      step: "validate_client_email",
      emailType: "client",
      requestId: request.id,
      paymentId,
    });
    result.clientEmail = "skipped_invalid_email";
  } else if (!(await claimEmailSend(supabase, request.id, "client"))) {
    result.clientEmail = "skipped_locked";
  } else {
    console.info("[consultation-email] sending client email", {
      step: "send_client_email",
      requestId: request.id,
      requestCode: request.request_code,
      paymentId,
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
          step: "send_client_email",
          requestId: request.id,
          requestCode: request.request_code,
          paymentId,
          emailType: "client",
          brevoStatus: sendResult.status,
          messageId: sendResult.messageId,
        },
      );
      await markConsultationEmailSent({
        supabase,
        requestId: request.id,
        emailKind: "client",
        messageId: sendResult.messageId,
      });
      result.clientEmail = "sent";
    } else {
      console.error("[consultation-email] client email Brevo error", {
        step: "send_client_email",
        requestId: request.id,
        requestCode: request.request_code,
        paymentId,
        emailType: "client",
        reason: sendResult.reason,
        status: sendResult.status,
        code: sendResult.code,
        message: sendResult.message,
        stack: sendResult.stack,
        skipped: sendResult.skipped ?? false,
      });
      await recordEmailFailure({
        supabase,
        requestId: request.id,
        emailKind: "client",
        message: sendResult.rawBody
          ? `${sendResult.message} | raw=${sendResult.rawBody}`
          : sendResult.message,
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
    const message =
      "Missing required email configuration: CONSULTATION_NOTIFICATION_EMAIL.";
    console.error(
      "[consultation-email] internal email skipped: notification recipient is missing",
      {
        step: "validate_internal_recipient",
        emailType: "internal",
        requestId: request.id,
        requestCode: request.request_code,
        paymentId,
        expectedVariable: "CONSULTATION_NOTIFICATION_EMAIL",
      },
    );
    await recordEmailFailure({
      supabase,
      requestId: request.id,
      emailKind: "internal",
      message,
    });
    result.internalEmail = "skipped_missing_recipient";
  } else if (!(await claimEmailSend(supabase, request.id, "internal"))) {
    result.internalEmail = "skipped_locked";
  } else {
    console.info("[consultation-email] sending internal email", {
      step: "send_internal_email",
      requestId: request.id,
      requestCode: request.request_code,
      paymentId,
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
          step: "send_internal_email",
          requestId: request.id,
          requestCode: request.request_code,
          paymentId,
          emailType: "internal",
          brevoStatus: sendResult.status,
          messageId: sendResult.messageId,
        },
      );
      await markConsultationEmailSent({
        supabase,
        requestId: request.id,
        emailKind: "internal",
        messageId: sendResult.messageId,
      });
      result.internalEmail = "sent";
    } else {
      console.error("[consultation-email] internal email Brevo error", {
        step: "send_internal_email",
        requestId: request.id,
        requestCode: request.request_code,
        paymentId,
        emailType: "internal",
        reason: sendResult.reason,
        status: sendResult.status,
        code: sendResult.code,
        message: sendResult.message,
        stack: sendResult.stack,
        skipped: sendResult.skipped ?? false,
      });
      await recordEmailFailure({
        supabase,
        requestId: request.id,
        emailKind: "internal",
        message: sendResult.rawBody
          ? `${sendResult.message} | raw=${sendResult.rawBody}`
          : sendResult.message,
      });
      result.internalEmail = "failed";
    }
  }

  console.info("[consultation-email] finished", result);
  return result;
}
