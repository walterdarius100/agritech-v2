import type { CreatePaymentResult } from "@/lib/payments/types";
export async function createNatCashPayment(): Promise<CreatePaymentResult> {
  // TODO: brancher l’endpoint officiel NatCash après obtention de la documentation et des clés marchandes.
  throw new Error("NatCash provider not configured. Use mock mode or configure official API credentials.");
}
