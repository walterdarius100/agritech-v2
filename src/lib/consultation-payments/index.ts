import {
  confirmMockConsultationPayment,
  createMockConsultationPayment,
  getMockConsultationPaymentStatus,
} from "@/lib/consultation-payments/providers/mock";
import {
  confirmUnavailableConsultationPayment,
  createUnavailableConsultationPayment,
  getUnavailableConsultationPaymentStatus,
} from "@/lib/consultation-payments/providers/unavailable";
import type {
  ConfirmConsultationPaymentInput,
  ConfirmConsultationPaymentResult,
  ConsultationPaymentProvider,
  ConsultationPaymentStatusResult,
  CreateConsultationPaymentInput,
  CreateConsultationPaymentResult,
} from "@/lib/consultation-payments/types";

export const consultationPaymentProviders: ConsultationPaymentProvider[] = [
  "mock",
  "moncash",
  "natcash",
  "manual",
];

export function normalizeConsultationPaymentProvider(value: unknown) {
  return consultationPaymentProviders.includes(
    value as ConsultationPaymentProvider,
  )
    ? (value as ConsultationPaymentProvider)
    : null;
}

export async function createConsultationPayment(
  input: CreateConsultationPaymentInput,
): Promise<CreateConsultationPaymentResult> {
  if (input.provider === "mock") return createMockConsultationPayment(input);
  return createUnavailableConsultationPayment(input);
}

export async function confirmConsultationPayment(
  input: ConfirmConsultationPaymentInput,
): Promise<ConfirmConsultationPaymentResult> {
  if (input.provider === "mock") return confirmMockConsultationPayment(input);
  return confirmUnavailableConsultationPayment(input);
}

export async function getConsultationPaymentStatus(
  input: ConfirmConsultationPaymentInput,
): Promise<ConsultationPaymentStatusResult> {
  if (input.provider === "mock") return getMockConsultationPaymentStatus(input);
  return getUnavailableConsultationPaymentStatus(input);
}

export type {
  ConfirmConsultationPaymentInput,
  ConfirmConsultationPaymentResult,
  ConsultationPaymentProvider,
  ConsultationPaymentStatusResult,
  CreateConsultationPaymentInput,
  CreateConsultationPaymentResult,
};
