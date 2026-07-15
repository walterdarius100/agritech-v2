import type {
  ConfirmConsultationPaymentInput,
  ConfirmConsultationPaymentResult,
  ConsultationPaymentStatusResult,
  CreateConsultationPaymentInput,
  CreateConsultationPaymentResult,
} from "@/lib/consultation-payments/types";

function unavailable(provider: string): Error {
  return new Error(
    `Le provider ${provider} n’est pas encore intégré. Utiliser uniquement après validation de la documentation officielle du fournisseur.`,
  );
}

export async function createUnavailableConsultationPayment(
  input: CreateConsultationPaymentInput,
): Promise<CreateConsultationPaymentResult> {
  throw unavailable(input.provider);
}

export async function confirmUnavailableConsultationPayment(
  input: ConfirmConsultationPaymentInput,
): Promise<ConfirmConsultationPaymentResult> {
  throw unavailable(input.provider);
}

export async function getUnavailableConsultationPaymentStatus(
  input: ConfirmConsultationPaymentInput,
): Promise<ConsultationPaymentStatusResult> {
  throw unavailable(input.provider);
}
