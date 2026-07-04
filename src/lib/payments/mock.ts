import type { CreatePaymentInput, CreatePaymentResult } from "@/lib/payments/types";
export function createMockPayment(input: CreatePaymentInput): CreatePaymentResult {
  if (!input.paymentId) throw new Error("Mock payment requires an existing paymentId.");
  return { paymentId: input.paymentId, provider: input.provider, providerReference: `mock_${input.paymentId}`, checkoutUrl: `/academy/payment/mock/${input.paymentId}`, status: "pending", instructions: "Paiement de test: aucun argent réel ne sera débité." };
}
