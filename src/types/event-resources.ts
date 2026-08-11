export type EventResourceType =
  "document" | "plan" | "guide" | "fiche_technique" | "presentation" | "autre";

export type EventResourceLanguage = "fr" | "en" | "es" | "ht";

export type EventResource = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  resource_type: EventResourceType;
  file_url: string;
  file_name: string | null;
  event_name: string | null;
  topic: string | null;
  language: EventResourceLanguage;
  is_active: boolean;
  requires_form: boolean;
  download_button_label: string;
  created_at: string;
  updated_at: string;
  metadata: Record<string, unknown>;
};

export type EventResourceLead = {
  id: string;
  resource_id: string;
  full_name: string;
  phone: string | null;
  email: string;
  organization: string | null;
  interest_area: string | null;
  consent_newsletter: boolean;
  consent_contact: boolean;
  source: string;
  event_name: string | null;
  page_path: string | null;
  created_at: string;
  metadata: Record<string, unknown>;
};
