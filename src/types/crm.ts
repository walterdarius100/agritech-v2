export type CrmSourceType = "contact" | "consultation" | "manual";

export type CrmManualSource = "manual" | "whatsapp" | "facebook" | "instagram" | "appel" | "email_direct" | "reference" | "terrain" | "autre";

export type CrmInterestLevel = "faible" | "moyen" | "eleve" | "tres_eleve";

export type CrmPriority = "basse" | "normale" | "haute" | "urgente";

export type CrmStatus =
  | "nouveau"
  | "a_qualifier"
  | "reunion_a_planifier"
  | "reunion_prevue"
  | "proposition_a_preparer"
  | "proposition_envoyee"
  | "relance_1"
  | "relance_2"
  | "gagne"
  | "perdu"
  | "en_attente"
  | "archive";

export type CrmOutcome =
  | "en_cours"
  | "gagne"
  | "perdu"
  | "abandonne"
  | "non_qualifie";

export type ClientPipelineCase = {
  id: string;
  case_code: string;
  source_type: CrmSourceType;
  source_id: string | null;
  first_contact_at: string;
  client_name: string;
  organization_name: string | null;
  primary_contact: string | null;
  phone: string | null;
  email: string | null;
  project_type: string | null;
  location: string | null;
  source: string;
  main_channel: string | null;
  interest_level: CrmInterestLevel;
  priority: CrmPriority;
  status: CrmStatus;
  next_action: string | null;
  responsible: string | null;
  meeting_date: string | null;
  meeting_time: string | null;
  meeting_confirmed: boolean;
  post_meeting_decision: string | null;
  proposal_sent_at: string | null;
  proposed_amount_usd: number | null;
  follow_up_1_at: string | null;
  follow_up_2_at: string | null;
  expected_close_at: string | null;
  expected_decision: string | null;
  last_interaction_at: string | null;
  alert_follow_up: boolean;
  outcome: CrmOutcome;
  next_action_at: string | null;
  admin_notes: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};
