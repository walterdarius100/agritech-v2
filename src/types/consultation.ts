export type ConsultationPaymentStatus =
  "pending" | "paid" | "failed" | "cancelled" | "refunded";

export type ConsultationRequestStatus =
  | "pending_payment"
  | "paid"
  | "scheduled"
  | "completed"
  | "cancelled"
  | "failed_payment";

export type ConsultationPaymentProvider =
  "mock" | "moncash" | "natcash" | "manual";

export type ConsultationRequest = {
  id: string;
  request_code: string;
  full_name: string;
  email: string | null;
  phone: string;
  department: string | null;
  commune: string | null;
  consultation_type: string;
  project_stage: string | null;
  project_description: string;
  estimated_budget: string | null;
  consultation_mode: string | null;
  consultation_package: string;
  amount: number;
  currency: string;
  payment_status: ConsultationPaymentStatus;
  request_status: ConsultationRequestStatus;
  paid_at: string | null;
  scheduled_at: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
};

export type ConsultationPayment = {
  id: string;
  consultation_request_id: string;
  provider: ConsultationPaymentProvider;
  provider_transaction_id: string | null;
  amount: number;
  currency: string;
  status: ConsultationPaymentStatus;
  payment_method: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  paid_at: string | null;
};

export type CreateConsultationRequestInput = Pick<
  ConsultationRequest,
  | "full_name"
  | "email"
  | "phone"
  | "department"
  | "commune"
  | "consultation_type"
  | "project_stage"
  | "project_description"
  | "estimated_budget"
  | "consultation_mode"
  | "consultation_package"
>;
