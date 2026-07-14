"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { createConsultationRequest } from "@/lib/consultation/createConsultationRequest";
import type { ConsultationRequestFormState } from "@/lib/consultation/createConsultationRequest";
import {
  consultationModes,
  consultationTypes,
  estimatedBudgets,
  projectStages,
} from "@/lib/consultation/options";

const initialState: ConsultationRequestFormState = {};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex w-full items-center justify-center rounded-full bg-emerald-700 px-6 py-3.5 text-base font-bold text-white shadow-sm transition hover:bg-emerald-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60 sm:w-auto"
    >
      {pending
        ? "Création de la demande..."
        : "Envoyer ma demande et continuer vers le paiement"}
    </button>
  );
}

type FieldErrorProps = {
  message?: string;
};

function FieldError({ message }: FieldErrorProps) {
  if (!message) return null;
  return <p className="mt-2 text-sm font-medium text-red-700">{message}</p>;
}

type SelectFieldProps = {
  id: string;
  name: string;
  label: string;
  placeholder: string;
  options: readonly string[];
  required?: boolean;
  error?: string;
};

function SelectField({
  id,
  name,
  label,
  placeholder,
  options,
  required = false,
  error,
}: SelectFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-bold text-emerald-950">
        {label}
      </label>
      <select
        id={id}
        name={name}
        required={required}
        aria-invalid={Boolean(error)}
        className="mt-2 w-full rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <FieldError message={error} />
    </div>
  );
}

export function ConsultationReservationForm() {
  const [state, formAction] = useActionState(
    createConsultationRequest,
    initialState,
  );
  const fieldErrors = state.fieldErrors ?? {};

  return (
    <form
      action={formAction}
      className="space-y-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-emerald-100 sm:p-8"
    >
      {state.error ? (
        <div
          className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800"
          role="alert"
        >
          {state.error}
        </div>
      ) : null}

      <section aria-labelledby="personal-info-title" className="space-y-5">
        <div>
          <p
            id="personal-info-title"
            className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-700"
          >
            Informations personnelles
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Ces informations permettront à Agri-tech de vous recontacter après
            la confirmation de votre demande.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label
              htmlFor="full_name"
              className="text-sm font-bold text-emerald-950"
            >
              Nom complet *
            </label>
            <input
              id="full_name"
              name="full_name"
              type="text"
              required
              autoComplete="name"
              aria-invalid={Boolean(fieldErrors.full_name)}
              className="mt-2 w-full rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            />
            <FieldError message={fieldErrors.full_name} />
          </div>

          <div>
            <label
              htmlFor="phone"
              className="text-sm font-bold text-emerald-950"
            >
              Téléphone WhatsApp *
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              required
              autoComplete="tel"
              aria-invalid={Boolean(fieldErrors.phone)}
              className="mt-2 w-full rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            />
            <FieldError message={fieldErrors.phone} />
          </div>

          <div>
            <label
              htmlFor="email"
              className="text-sm font-bold text-emerald-950"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              aria-invalid={Boolean(fieldErrors.email)}
              className="mt-2 w-full rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            />
            <FieldError message={fieldErrors.email} />
          </div>

          <div>
            <label
              htmlFor="department"
              className="text-sm font-bold text-emerald-950"
            >
              Département
            </label>
            <input
              id="department"
              name="department"
              type="text"
              autoComplete="address-level1"
              className="mt-2 w-full rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <div>
            <label
              htmlFor="commune"
              className="text-sm font-bold text-emerald-950"
            >
              Commune
            </label>
            <input
              id="commune"
              name="commune"
              type="text"
              autoComplete="address-level2"
              className="mt-2 w-full rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            />
          </div>
        </div>
      </section>

      <section aria-labelledby="project-info-title" className="space-y-5">
        <div>
          <p
            id="project-info-title"
            className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-700"
          >
            Projet et besoin
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Décrivez le contexte avec simplicité. L’équipe Agri-tech affinera
            les informations avec vous si nécessaire.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <SelectField
            id="consultation_type"
            name="consultation_type"
            label="Domaine concerné *"
            placeholder="Choisir un domaine"
            options={consultationTypes}
            required
            error={fieldErrors.consultation_type}
          />
          <SelectField
            id="project_stage"
            name="project_stage"
            label="Niveau d’avancement du projet"
            placeholder="Choisir une option"
            options={projectStages}
          />
          <SelectField
            id="consultation_mode"
            name="consultation_mode"
            label="Mode de consultation souhaité"
            placeholder="Choisir un mode"
            options={consultationModes}
          />
          <SelectField
            id="estimated_budget"
            name="estimated_budget"
            label="Budget approximatif"
            placeholder="Choisir une tranche"
            options={estimatedBudgets}
          />
        </div>

        <div>
          <label
            htmlFor="project_description"
            className="text-sm font-bold text-emerald-950"
          >
            Décrivez votre projet ou votre besoin *
          </label>
          <textarea
            id="project_description"
            name="project_description"
            required
            rows={7}
            placeholder="Expliquez brièvement votre projet, votre problème ou le type d’accompagnement recherché."
            aria-invalid={Boolean(fieldErrors.project_description)}
            className="mt-2 w-full rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
          />
          <FieldError message={fieldErrors.project_description} />
        </div>
      </section>

      <div className="flex flex-col items-center gap-3 border-t border-emerald-100 pt-6 text-center">
        <SubmitButton />
        <p className="max-w-md text-sm leading-6 text-slate-500">
          Après validation du formulaire, votre demande sera créée avec le
          statut « paiement en attente », puis vous serez redirigé vers le
          checkout.
        </p>
      </div>
    </form>
  );
}
