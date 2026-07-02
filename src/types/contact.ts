export type ContactRequestType =
  | "general"
  | "service"
  | "formation"
  | "academy_access"
  | "partnership"
  | "other";

export type ContactRequestStatus =
  | "new"
  | "in_review"
  | "contacted"
  | "converted"
  | "closed"
  | "spam";

export type ContactRequestPriority = "low" | "normal" | "high" | "urgent";

export type ContactRequest = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  organization: string | null;
  request_type: ContactRequestType;
  service_slug: string | null;
  formation_slug: string | null;
  course_slug: string | null;
  course_title: string | null;
  metadata: Record<string, unknown> | null;
  subject: string | null;
  message: string;
  source_page: string | null;
  status: ContactRequestStatus;
  priority: ContactRequestPriority;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateContactRequestInput = Pick<
  ContactRequest,
  | "full_name"
  | "email"
  | "phone"
  | "organization"
  | "request_type"
  | "service_slug"
  | "formation_slug"
  | "course_slug"
  | "course_title"
  | "subject"
  | "message"
  | "source_page"
> & {
  company_website?: string;
};
