"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  submitEventResourceLead,
  type EventResourceLeadFormState,
} from "@/lib/event-resources/submitEventResourceLead";

const initialState: EventResourceLeadFormState = {};

const copy = {
  fr: {
    fullName: "Nom complet",
    phone: "Téléphone WhatsApp",
    organization: "Organisation / Institution",
    organizationPlaceholder: "Optionnel",
    interest: "Domaine d’intérêt",
    interestPlaceholder: "Optionnel",
    newsletter: "Je souhaite recevoir les actualités et conseils d’Agri-tech.",
    submit: "Accéder à la ressource",
    submitting: "Enregistrement…",
    secure:
      "Vos coordonnées sont utilisées pour vous donner accès à cette ressource.",
  },
  en: {
    fullName: "Full name",
    phone: "WhatsApp phone",
    organization: "Organization / Institution",
    organizationPlaceholder: "Optional",
    interest: "Area of interest",
    interestPlaceholder: "Optional",
    newsletter: "I would like to receive Agri-tech news and advice.",
    submit: "Access the resource",
    submitting: "Saving…",
    secure:
      "Your contact details are used to give you access to this resource.",
  },
  es: {
    fullName: "Nombre completo",
    phone: "Teléfono WhatsApp",
    organization: "Organización / Institución",
    organizationPlaceholder: "Opcional",
    interest: "Área de interés",
    interestPlaceholder: "Opcional",
    newsletter: "Deseo recibir noticias y consejos de Agri-tech.",
    submit: "Acceder al recurso",
    submitting: "Guardando…",
    secure: "Sus datos se utilizan para darle acceso a este recurso.",
  },
} as const;

function SubmitButton({ language }: { language: keyof typeof copy }) {
  const { pending } = useFormStatus();
  const labels = copy[language];

  return (
    <button
      className="min-h-12 w-full rounded-2xl bg-emerald-700 px-5 py-3 font-bold text-white shadow-sm transition hover:bg-emerald-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 disabled:opacity-60"
      disabled={pending}
      type="submit"
    >
      {pending ? labels.submitting : labels.submit}
    </button>
  );
}

export function EventResourceLeadForm({
  slug,
  language,
}: {
  slug: string;
  language: "fr" | "en" | "es" | "ht";
}) {
  const uiLanguage = language === "ht" ? "fr" : language;
  const labels = copy[uiLanguage];
  const boundAction = submitEventResourceLead.bind(null, slug);
  const [state, formAction] = useActionState(boundAction, initialState);

  if (state.ok && state.downloadUrl) {
    return (
      <div
        className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6"
        role="status"
      >
        <p className="font-semibold leading-7 text-emerald-950">
          {state.message}
        </p>
        <a
          className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-emerald-700 px-5 py-3 text-center font-bold text-white shadow-sm transition hover:bg-emerald-800 sm:w-auto"
          href={state.downloadUrl}
          rel="noopener noreferrer"
          target="_blank"
          download={state.fileName || undefined}
        >
          {state.downloadLabel || "Télécharger la ressource"}
        </a>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      <input
        aria-hidden="true"
        autoComplete="off"
        className="hidden"
        name="company_website"
        tabIndex={-1}
        type="text"
      />

      {state.message ? (
        <p
          className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800"
          role="alert"
        >
          {state.message}
        </p>
      ) : null}

      <Field
        error={state.fieldErrors?.full_name}
        label={labels.fullName}
        maxLength={120}
        name="full_name"
        required
      />
      <Field
        error={state.fieldErrors?.phone}
        label={labels.phone}
        maxLength={40}
        name="phone"
        required
        type="tel"
      />
      <Field
        error={state.fieldErrors?.email}
        label="Email"
        maxLength={254}
        name="email"
        required
        type="email"
      />
      <Field
        error={state.fieldErrors?.organization}
        label={labels.organization}
        maxLength={180}
        name="organization"
        placeholder={labels.organizationPlaceholder}
      />
      <Field
        error={state.fieldErrors?.interest_area}
        label={labels.interest}
        maxLength={180}
        name="interest_area"
        placeholder={labels.interestPlaceholder}
      />

      <label className="flex items-start gap-3 text-sm leading-6 text-slate-600">
        <input
          className="mt-1 size-4 shrink-0 accent-emerald-700"
          name="consent_newsletter"
          type="checkbox"
        />
        <span>{labels.newsletter}</span>
      </label>

      <SubmitButton language={uiLanguage} />
      <p className="text-center text-xs leading-5 text-slate-500">
        {labels.secure}
      </p>
    </form>
  );
}

function Field({
  error,
  label,
  maxLength,
  name,
  placeholder,
  required = false,
  type = "text",
}: {
  error?: string;
  label: string;
  maxLength: number;
  name: string;
  placeholder?: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-bold text-emerald-950">
      <span>
        {label}
        {required ? " *" : ""}
      </span>
      <input
        aria-invalid={Boolean(error)}
        autoComplete={
          name === "full_name"
            ? "name"
            : name === "phone"
              ? "tel"
              : name === "email"
                ? "email"
                : "organization"
        }
        className="min-h-12 rounded-2xl border border-slate-200 bg-white px-4 py-3 font-normal text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
        maxLength={maxLength}
        name={name}
        placeholder={placeholder}
        required={required}
        type={type}
      />
      {error ? (
        <span className="text-sm font-medium text-red-700">{error}</span>
      ) : null}
    </label>
  );
}
