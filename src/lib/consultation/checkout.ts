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
  "id,request_code,full_name,email,phone,department,commune,consultation_type,project_stage,project_description,estimated_budget,consultation_mode,consultation_package,amount,currency,payment_status,request_status,paid_at,scheduled_at,admin_notes,client_email_sent_at,internal_email_sent_at,created_at,updated_at";

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

function logConsultationPayment(
  message: string,
  context: Record<string, unknown>,
) {
  console.info(`[consultation-payment] ${message}`, context);
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
  const requestId =
    typeof formData.get("request_id") === "string"
      ? String(formData.get("request_id"))
      : "";
  const paymentMethod = cleanPaymentMethod(formData.get("payment_method"));

  if (!requestId) return { error: "Demande introuvable." };

  logConsultationPayment("mock payment confirmation started", {
    requestId,
    paymentMethod,
  });

  const supabase = getAdminClientOrThrow();
  const { data: request, error: requestError } = await supabase
    .from("consultation_requests")
    .select(CONSULTATION_REQUEST_COLUMNS)
    .eq("id", requestId)
    .maybeSingle();

  if (requestError || !request) {
    return { error: "Demande introuvable." };
  }

  const consultationRequest = request as ConsultationRequest;
  logConsultationPayment("request found", {
    requestId,
    request_code: consultationRequest.request_code,
    payment_status: consultationRequest.payment_status,
    request_status: consultationRequest.request_status,
    clientEmailPresent: Boolean(consultationRequest.email),
    clientEmailSentAtPresent: Boolean(consultationRequest.client_email_sent_at),
    internalEmailSentAtPresent: Boolean(
      consultationRequest.internal_email_sent_at,
    ),
  });

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
    let payableRequest = consultationRequest;

    if (
      existingPaidPayment &&
      (consultationRequest.payment_status !== "paid" ||
        consultationRequest.request_status !== "paid")
    ) {
      const paidAt = consultationRequest.paid_at ?? new Date().toISOString();
      const { data: reconciledRequest, error: reconcileError } = await supabase
        .from("consultation_requests")
        .update({
          payment_status: "paid",
          request_status: "paid",
          paid_at: paidAt,
        })
        .eq("id", requestId)
        .select(CONSULTATION_REQUEST_COLUMNS)
        .single();

      if (reconcileError || !reconciledRequest) {
        console.error("[consultation-payment] paid request reconciliation failed", {
          requestId,
          message: reconcileError?.message,
        });
      } else {
        payableRequest = reconciledRequest as ConsultationRequest;
        logConsultationPayment("payment update success", {
          requestId,
          request_code: payableRequest.request_code,
          payment_status: payableRequest.payment_status,
          request_status: payableRequest.request_status,
          reconciledExistingPaidPayment: true,
        });
      }
    }

    try {
      await sendConsultationPaidEmails(supabase, payableRequest);
    } catch (error) {
      console.error(
        "[consultation-email] paid consultation email workflow failed",
        {
          requestId,
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
  const confirmedPayment = await confirmConsultationPayment({
    provider: "mock",
    requestId,
    providerTransactionId: createdPayment.providerTransactionId,
  });
  const paidAt = confirmedPayment.paidAt ?? new Date().toISOString();

  logConsultationPayment("payment_status before update", {
    requestId,
    request_code: consultationRequest.request_code,
    payment_status: consultationRequest.payment_status,
  });
  logConsultationPayment("request_status before update", {
    requestId,
    request_code: consultationRequest.request_code,
    request_status: consultationRequest.request_status,
  });

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

  if (updateRequestError || !paidRequest) {
    return {
      error:
        "Le paiement a été enregistré, mais la demande n’a pas pu être mise à jour. Veuillez contacter Agri-tech.",
    };
  }

  logConsultationPayment("payment update success", {
    requestId,
    request_code: (paidRequest as ConsultationRequest).request_code,
    payment_status: (paidRequest as ConsultationRequest).payment_status,
    request_status: (paidRequest as ConsultationRequest).request_status,
  });

  try {
    await sendConsultationPaidEmails(
      supabase,
      paidRequest as ConsultationRequest,
    );
  } catch (error) {
    console.error(
      "[consultation-email] paid consultation email workflow failed",
      {
        requestId,
        message:
          error instanceof Error
            ? error.message
            : "Unknown email workflow error",
      },
    );
  }

  redirect(`/consultation/confirmation/${requestId}`);
}
