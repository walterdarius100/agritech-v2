export type PaymentProvider = "moncash" | "natcash" | "mock";
export type PaymentStatus = "pending" | "processing" | "paid" | "failed" | "cancelled" | "expired" | "manual_review";
export type PaymentCurrency = "HTG" | "USD";
export interface CreatePaymentInput { studentId:string; courseId:string; amount:number; currency:PaymentCurrency; provider:PaymentProvider; courseSlug:string; returnUrl:string; cancelUrl:string; paymentId?:string; }
export interface CreatePaymentResult { paymentId:string; provider:PaymentProvider; providerReference?:string; checkoutUrl?:string; status:PaymentStatus; instructions?:string; }
