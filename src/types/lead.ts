export type LeadStatus = "new" | "contacted" | "qualified" | "closed" | "archived";

export type Lead = {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  request_type: string | null;
  domain: string | null;
  message: string | null;
  source_page: string | null;
  status: LeadStatus;
  created_at: string | null;
  updated_at: string | null;
};
