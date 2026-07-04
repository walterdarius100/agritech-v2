import type { CreatePaymentResult } from "@/lib/payments/types";
export async function createMonCashPayment(): Promise<CreatePaymentResult> {
  // TODO: brancher l’endpoint officiel MonCash après obtention de la documentation et des clés marchandes.
  throw new Error("MonCash provider not configured. Use mock mode or configure official API credentials.");
}
