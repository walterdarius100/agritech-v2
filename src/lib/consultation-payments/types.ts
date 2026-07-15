import type { ConsultationPaymentStatus } from "@/types/consultation";

export type ConsultationPaymentProvider =
  "mock" | "moncash" | "natcash" | "manual";

export type ConsultationPaymentCurrency = "HTG" | "USD";

export type ConsultationPaymentMethod = "moncash" | "natcash" | "manual";

export type CreateConsultationPaymentInput = {
  provider: ConsultationPaymentProvider;
  requestId: string;
  requestCode: string;
  amount: number;
  currency: ConsultationPaymentCurrency | string;
  paymentMethod?: ConsultationPaymentMethod;
  returnUrl?: string;
  cancelUrl?: string;
};

export type CreateConsultationPaymentResult = {
  provider: ConsultationPaymentProvider;
  providerTransactionId: string | null;
  status: ConsultationPaymentStatus;
  checkoutUrl: string | null;
  metadata: Record<string, unknown>;
};

export type ConfirmConsultationPaymentInput = {
  provider: ConsultationPaymentProvider;
  requestId: string;
  providerTransactionId?: string | null;
};

export type ConfirmConsultationPaymentResult = {
  status: ConsultationPaymentStatus;
  paidAt: string | null;
  metadata: Record<string, unknown>;
};

export type ConsultationPaymentStatusResult = {
  status: ConsultationPaymentStatus;
  providerTransactionId: string | null;
  metadata: Record<string, unknown>;
};
