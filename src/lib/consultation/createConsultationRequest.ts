"use server";

import { redirect } from "next/navigation";

import {
  consultationAmount,
  consultationCurrency,
  consultationModes,
  consultationPackage,
  consultationTypes,
  estimatedBudgets,
  projectStages,
} from "@/lib/consultation/options";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export type ConsultationRequestFormState = {
  error?: string;
  fieldErrors?: Partial<Record<string, string>>;
};

type ConsultationRequestPayload = {
  full_name: string;
  email: string;
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
  payment_status: "pending";
  request_status: "pending_payment";
};

const limits = {
  fullName: 120,
  phone: 40,
  email: 180,
  department: 120,
  commune: 120,
  description: 3000,
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clean(value: FormDataEntryValue | null, maxLength: number) {
  const text =
    typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
  return text.slice(0, maxLength);
}

function cleanMultiline(value: FormDataEntryValue | null, maxLength: number) {
  const text = typeof value === "string" ? value.trim() : "";
  return text.slice(0, maxLength);
}

function nullable(value: string) {
  return value.length > 0 ? value : null;
}

function readAllowedValue<T extends readonly string[]>(
  value: FormDataEntryValue | null,
  allowedValues: T,
) {
  const text = typeof value === "string" ? value.trim() : "";
  return allowedValues.includes(text as T[number]) ? text : "";
}

function validateConsultationRequestForm(
  formData: FormData,
):
  | { ok: true; payload: ConsultationRequestPayload }
  | { ok: false; state: ConsultationRequestFormState } {
  const fullName = clean(formData.get("full_name"), limits.fullName);
  const phone = clean(formData.get("phone"), limits.phone);
  const email = clean(formData.get("email"), limits.email).toLowerCase();
  const department = clean(formData.get("department"), limits.department);
  const commune = clean(formData.get("commune"), limits.commune);
  const consultationType = readAllowedValue(
    formData.get("consultation_type"),
    consultationTypes,
  );
  const projectStage = readAllowedValue(
    formData.get("project_stage"),
    projectStages,
  );
  const consultationMode = readAllowedValue(
    formData.get("consultation_mode"),
    consultationModes,
  );
  const estimatedBudget = readAllowedValue(
    formData.get("estimated_budget"),
    estimatedBudgets,
  );
  const projectDescription = cleanMultiline(
    formData.get("project_description"),
    limits.description,
  );

  const fieldErrors: ConsultationRequestFormState["fieldErrors"] = {};

  if (!fullName) fieldErrors.full_name = "Le nom complet est obligatoire.";
  if (!phone) fieldErrors.phone = "Le téléphone WhatsApp est obligatoire.";
  if (!email) fieldErrors.email = "L’email est obligatoire.";
  else if (!emailPattern.test(email))
    fieldErrors.email = "Veuillez saisir un email valide.";
  if (!consultationType)
    fieldErrors.consultation_type = "Le domaine concerné est obligatoire.";
  if (!projectDescription)
    fieldErrors.project_description =
      "La description du besoin est obligatoire.";
  if (Object.keys(fieldErrors).length > 0) {
    return {
      ok: false,
      state: {
        error: "Veuillez corriger les champs indiqués avant de continuer.",
        fieldErrors,
      },
    };
  }

  return {
    ok: true,
    payload: {
      full_name: fullName,
      email,
      phone,
      department: nullable(department),
      commune: nullable(commune),
      consultation_type: consultationType,
      project_stage: nullable(projectStage),
      project_description: projectDescription,
      estimated_budget: nullable(estimatedBudget),
      consultation_mode: nullable(consultationMode),
      consultation_package: consultationPackage,
      amount: consultationAmount,
      currency: consultationCurrency,
      payment_status: "pending",
      request_status: "pending_payment",
    },
  };
}

export async function createConsultationRequest(
  _state: ConsultationRequestFormState,
  formData: FormData,
): Promise<ConsultationRequestFormState> {
  const validated = validateConsultationRequestForm(formData);
  if (!validated.ok) return validated.state;

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return {
      error:
        "Une erreur est survenue lors de l’envoi de votre demande. Veuillez réessayer.",
    };
  }

  const { data, error } = await supabase
    .from("consultation_requests")
    .insert(validated.payload)
    .select("id")
    .single();

  if (error || !data?.id) {
    console.error("Unable to create consultation request", error?.message);
    return {
      error:
        "Une erreur est survenue lors de l’envoi de votre demande. Veuillez réessayer.",
    };
  }

  redirect(`/consultation/checkout/${data.id}`);
}
