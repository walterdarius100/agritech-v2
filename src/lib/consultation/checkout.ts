"use server";

import { redirect } from "next/navigation";

import {
  createConsultationPayment,
  confirmConsultationPayment,
} from "@/lib/consultation-payments";
import type { ConsultationPaymentMethod } from "@/lib/consultation-payments/types";
import { sendConsultationPaidEmails } from "@/lib/consultation/emails";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import type {
  ConsultationPayment,
  ConsultationRequest,
} from "@/types/consultation";

const CONSULTATION_REQUEST_COLUMNS =
  "id,request_code,full_name,email,phone,department,commune,consultation_type,project_stage,project_description,estimated_budget,consultation_mode,consultation_package,amount,currency,payment_status,request_status,paid_at,scheduled_at,admin_notes,client_email_sent_at,internal_email_sent_at,client_email_message_id,internal_email_message_id,email_last_attempt_at,email_last_error,client_email_last_error,internal_email_last_error,client_email_processing_at,internal_email_processing_at,created_at,updated_at";

const CONSULTATION_PAYMENT_COLUMNS =
  "id,consultation_request_id,provider,provider_transaction_id,amount,currency,status,payment_method,metadata,created_at,updated_at,paid_at";

export type ConsultationCheckoutRequest = ConsultationRequest & {
  paid_payment: ConsultationPayment | null;
};

export type ConsultationPaymentActionState = {
  error?: string;
};

const mockPaymentMethods = ["moncash", "natcash", "manual"] as const;

function getAdminClientOrThrow() {
  const supabase = createSupabaseAdminClient();
  if (!supabase) throw new Error("Configuration Supabase admin manquante.");
  return supabase;
}

function cleanPaymentMethod(
  value: FormDataEntryValue | null,
): ConsultationPaymentMethod {
  const text = typeof value === "string" ? value.trim() : "";
  return mockPaymentMethods.includes(text as ConsultationPaymentMethod)
    ? (text as ConsultationPaymentMethod)
    : "manual";
}

export async function getConsultationCheckoutRequest(
  requestId: string,
): Promise<ConsultationCheckoutRequest | null> {
  const supabase = getAdminClientOrThrow();
  const { data: request, error: requestError } = await supabase
    .from("consultation_requests")
    .select(CONSULTATION_REQUEST_COLUMNS)
    .eq("id", requestId)
    .maybeSingle();

  if (requestError) throw new Error(requestError.message);
  if (!request) return null;

  const { data: paidPayment, error: paymentError } = await supabase
    .from("consultation_payments")
    .select(CONSULTATION_PAYMENT_COLUMNS)
    .eq("consultation_request_id", requestId)
    .eq("status", "paid")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (paymentError) throw new Error(paymentError.message);

  return {
    ...(request as ConsultationRequest),
    paid_payment: (paidPayment as ConsultationPayment | null) ?? null,
  };
}

export async function confirmConsultationMockPayment(
  _state: ConsultationPaymentActionState,
  formData: FormData,
): Promise<ConsultationPaymentActionState> {
  const processingStartedAt = new Date().toISOString();
  console.info("[consultation-payment] mock payment confirmation started", {
    processingStartedAt,
    entrypoint: "server_action:confirmConsultationMockPayment",
    userId: null,
  });
  const requestId =
    typeof formData.get("request_id") === "string"
      ? String(formData.get("request_id"))
      : "";
  const paymentMethod = cleanPaymentMethod(formData.get("payment_method"));

  console.info("[consultation-payment] requestId received", {
    requestIdPresent: Boolean(requestId),
  });

  if (!requestId) return { error: "Demande introuvable." };

  const supabase = getAdminClientOrThrow();
  const { data: request, error: requestError } = await supabase
    .from("consultation_requests")
    .select(CONSULTATION_REQUEST_COLUMNS)
    .eq("id", requestId)
    .maybeSingle();

  console.info("[consultation-payment] request found", Boolean(request));
  if (request) {
    console.info("[consultation-payment] payment_status before update", {
      payment_status: request.payment_status,
    });
    console.info("[consultation-payment] request_status before update", {
      request_status: request.request_status,
    });
  }

  if (requestError || !request) {
    return { error: "Demande introuvable." };
  }

  const consultationRequest = request as ConsultationRequest;

  const { data: existingPaidPayment, error: existingPaymentError } =
    await supabase
      .from("consultation_payments")
      .select("id")
      .eq("consultation_request_id", requestId)
      .eq("status", "paid")
      .limit(1)
      .maybeSingle();

  if (existingPaymentError) {
    return {
      error:
        "Une erreur est survenue pendant la vérification du paiement. Veuillez réessayer.",
    };
  }

  if (consultationRequest.payment_status === "paid" || existingPaidPayment) {
    try {
      console.info("[consultation-payment] calling sendConsultationPaidEmails");
      await sendConsultationPaidEmails(supabase, requestId);
      console.info(
        "[consultation-payment] sendConsultationPaidEmails finished",
      );
    } catch (error) {
      console.error(
        "[consultation-email] paid consultation email workflow failed",
        {
          requestId,
          step: "send_consultation_paid_emails",
          transactionId: existingPaidPayment?.id,
          stack: error instanceof Error ? error.stack : undefined,
          message:
            error instanceof Error
              ? error.message
              : "Unknown email workflow error",
        },
      );
    }

    redirect(`/consultation/confirmation/${requestId}`);
  }

  const createdPayment = await createConsultationPayment({
    provider: "mock",
    requestId,
    requestCode: consultationRequest.request_code,
    amount: consultationRequest.amount,
    currency: consultationRequest.currency,
    paymentMethod,
  });
  console.info("[consultation-payment] provider confirmation started", {
    requestId,
    orderId: requestId,
    transactionId: createdPayment.providerTransactionId,
    provider: createdPayment.provider,
    userId: null,
    processedAt: new Date().toISOString(),
  });
  const confirmedPayment = await confirmConsultationPayment({
    provider: "mock",
    requestId,
    providerTransactionId: createdPayment.providerTransactionId,
  });
  console.info("[consultation-payment] provider confirmation finished", {
    requestId,
    orderId: requestId,
    transactionId: createdPayment.providerTransactionId,
    providerStatus: confirmedPayment.status,
    paidAt: confirmedPayment.paidAt,
    userId: null,
    processedAt: new Date().toISOString(),
  });
  const paidAt = confirmedPayment.paidAt ?? new Date().toISOString();

  const { error: insertPaymentError } = await supabase
    .from("consultation_payments")
    .insert({
      consultation_request_id: requestId,
      provider: createdPayment.provider,
      provider_transaction_id: createdPayment.providerTransactionId,
      amount: consultationRequest.amount,
      currency: consultationRequest.currency,
      status: confirmedPayment.status,
      payment_method: paymentMethod,
      metadata: {
        ...createdPayment.metadata,
        ...confirmedPayment.metadata,
      },
      paid_at: paidAt,
    });

  if (insertPaymentError) {
    return {
      error:
        "Une erreur est survenue lors de la confirmation du paiement. Veuillez réessayer.",
    };
  }

  const { data: paidRequest, error: updateRequestError } = await supabase
    .from("consultation_requests")
    .update({
      payment_status: confirmedPayment.status,
      request_status: "paid",
      paid_at: paidAt,
    })
    .eq("id", requestId)
    .select(CONSULTATION_REQUEST_COLUMNS)
    .single();

  console.info("[consultation-payment] payment update success", {
    success: Boolean(paidRequest && !updateRequestError),
    requestId,
    orderId: requestId,
    transactionId: createdPayment.providerTransactionId,
    providerStatus: confirmedPayment.status,
    userId: null,
    processedAt: new Date().toISOString(),
  });

  if (updateRequestError || !paidRequest) {
    return {
      error:
        "Le paiement a été enregistré, mais la demande n’a pas pu être mise à jour. Veuillez contacter Agri-tech.",
    };
  }

  try {
    console.info("[consultation-payment] calling sendConsultationPaidEmails");
    await sendConsultationPaidEmails(supabase, requestId);
    console.info("[consultation-payment] sendConsultationPaidEmails finished");
  } catch (error) {
    console.error(
      "[consultation-email] paid consultation email workflow failed",
      {
        requestId,
        step: "send_consultation_paid_emails",
        transactionId: createdPayment.providerTransactionId,
        stack: error instanceof Error ? error.stack : undefined,
        message:
          error instanceof Error
            ? error.message
            : "Unknown email workflow error",
      },
    );
  }

  redirect(`/consultation/confirmation/${requestId}`);
}
