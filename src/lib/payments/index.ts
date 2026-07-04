import { createMockPayment } from "@/lib/payments/mock";
import { createMonCashPayment } from "@/lib/payments/moncash";
import { createNatCashPayment } from "@/lib/payments/natcash";
import type { CreatePaymentInput, CreatePaymentResult, PaymentProvider } from "@/lib/payments/types";
export function getAcademyPaymentsMode() { return process.env.ACADEMY_PAYMENTS_MODE === "production" ? "production" : "mock"; }
export function isCheckoutEnabled() { return process.env.NEXT_PUBLIC_ACADEMY_CHECKOUT_ENABLED === "true"; }
export async function createProviderPayment(input: CreatePaymentInput): Promise<CreatePaymentResult> {
  if (getAcademyPaymentsMode() === "mock") return createMockPayment(input);
  if (input.provider === "moncash") return createMonCashPayment();
  if (input.provider === "natcash") return createNatCashPayment();
  throw new Error("Unsupported payment provider.");
}
export function normalizePaymentProvider(value: unknown): PaymentProvider | null { return value === "moncash" || value === "natcash" ? value : null; }
