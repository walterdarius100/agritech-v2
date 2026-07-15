import type {
  ConfirmConsultationPaymentInput,
  ConfirmConsultationPaymentResult,
  ConsultationPaymentStatusResult,
  CreateConsultationPaymentInput,
  CreateConsultationPaymentResult,
} from "@/lib/consultation-payments/types";

export async function createMockConsultationPayment(
  input: CreateConsultationPaymentInput,
): Promise<CreateConsultationPaymentResult> {
  return {
    provider: "mock",
    providerTransactionId: `mock-${input.requestId}-${Date.now()}`,
    status: "paid",
    checkoutUrl: null,
    metadata: {
      mode: "mock",
      selected_method: input.paymentMethod ?? "moncash",
      request_code: input.requestCode,
    },
  };
}

export async function confirmMockConsultationPayment(
  input: ConfirmConsultationPaymentInput,
): Promise<ConfirmConsultationPaymentResult> {
  return {
    status: "paid",
    paidAt: new Date().toISOString(),
    metadata: { mode: "mock", request_id: input.requestId },
  };
}

export async function getMockConsultationPaymentStatus(
  input: ConfirmConsultationPaymentInput,
): Promise<ConsultationPaymentStatusResult> {
  return {
    status: "paid",
    providerTransactionId: input.providerTransactionId ?? null,
    metadata: { mode: "mock", request_id: input.requestId },
  };
}
