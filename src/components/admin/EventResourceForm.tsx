"use client";

import { useActionState } from "react";

import type { EventResourceFormState } from "@/lib/event-resources/adminResources";
import type {
  EventResourceLanguage,
  EventResourceType,
} from "@/types/event-resources";

const resourceTypes: EventResourceType[] = [
  "document",
  "plan",
  "guide",
  "fiche_technique",
  "presentation",
  "autre",
];
const resourceLanguages: EventResourceLanguage[] = ["fr", "en", "es", "ht"];

type Defaults = {
  title: string;
  slug: string;
  description: string;
  resource_type: EventResourceType;
  file_url: string;
  file_name: string;
  event_name: string;
  topic: string;
  language: EventResourceLanguage;
  is_active: boolean;
  download_button_label: string;
  metadata: string;
};

export function EventResourceForm({
  action,
  defaults,
  submitLabel,
}: {
  action: (
    state: EventResourceFormState,
    formData: FormData,
  ) => Promise<EventResourceFormState>;
  defaults: Defaults;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form
      action={formAction}
      className="space-y-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8"
    >
      {state.error ? (
        <p
          className="rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-800"
          role="alert"
        >
          {state.error}
        </p>
      ) : null}
      <div className="grid gap-5 md:grid-cols-2">
        <Field
          defaultValue={defaults.title}
          label="Titre"
          maxLength={180}
          name="title"
          required
        />
        <Field
          defaultValue={defaults.slug}
          help="Minuscules, chiffres et tirets uniquement."
          label="Slug"
          maxLength={160}
          name="slug"
          pattern="[a-z0-9]+(-[a-z0-9]+)*"
          required
        />
        <Textarea
          className="md:col-span-2"
          defaultValue={defaults.description}
          label="Description"
          maxLength={2000}
          name="description"
          rows={5}
        />
        <Select
          defaultValue={defaults.resource_type}
          label="Type de ressource"
          name="resource_type"
          options={resourceTypes}
        />
        <Select
          defaultValue={defaults.language}
          label="Langue"
          name="language"
          options={resourceLanguages}
        />
        <Field
          className="md:col-span-2"
          defaultValue={defaults.file_url}
          help="URL HTTP(S) ou chemin local commençant par /."
          label="URL du fichier"
          maxLength={2000}
          name="file_url"
          required
        />
        <Field
          defaultValue={defaults.file_name}
          label="Nom du fichier"
          maxLength={255}
          name="file_name"
        />
        <Field
          defaultValue={defaults.event_name}
          label="Nom de l’événement"
          maxLength={255}
          name="event_name"
        />
        <Field
          defaultValue={defaults.topic}
          label="Sujet"
          maxLength={255}
          name="topic"
        />
        <Field
          defaultValue={defaults.download_button_label}
          label="Libellé du bouton"
          maxLength={120}
          name="download_button_label"
          required
        />
        <Textarea
          className="md:col-span-2 font-mono"
          defaultValue={defaults.metadata}
          help="Objet JSON réservé aux informations complémentaires."
          label="Métadonnées"
          maxLength={10000}
          name="metadata"
          rows={5}
        />
      </div>
      <label className="flex items-center gap-3 text-sm font-semibold text-slate-700">
        <input
          className="size-4 accent-emerald-700"
          defaultChecked={defaults.is_active}
          name="is_active"
          type="checkbox"
        />
        Ressource active et accessible via son lien
      </label>
      <p className="rounded-2xl bg-emerald-50 p-4 text-sm leading-6 text-emerald-900">
        Ce lien pourra être transformé en QR code et inséré dans votre
        présentation PowerPoint.
      </p>
      <button
        className="min-h-11 rounded-xl bg-emerald-700 px-6 font-bold text-white hover:bg-emerald-800 disabled:opacity-60"
        disabled={pending}
        type="submit"
      >
        {pending ? "Enregistrement…" : submitLabel}
      </button>
    </form>
  );
}

function Field({
  className = "",
  defaultValue,
  help,
  label,
  maxLength,
  name,
  pattern,
  required = false,
}: {
  className?: string;
  defaultValue: string;
  help?: string;
  label: string;
  maxLength: number;
  name: string;
  pattern?: string;
  required?: boolean;
}) {
  return (
    <label
      className={`grid gap-2 text-sm font-semibold text-slate-700 ${className}`}
    >
      {label}
      {required ? " *" : ""}
      <input
        className="min-h-11 rounded-xl border border-slate-300 px-4 font-normal outline-none focus:border-emerald-600"
        defaultValue={defaultValue}
        maxLength={maxLength}
        name={name}
        pattern={pattern}
        required={required}
      />
      {help ? (
        <span className="text-xs font-normal text-slate-500">{help}</span>
      ) : null}
    </label>
  );
}

function Textarea({
  className = "",
  defaultValue,
  help,
  label,
  maxLength,
  name,
  rows,
}: {
  className?: string;
  defaultValue: string;
  help?: string;
  label: string;
  maxLength: number;
  name: string;
  rows: number;
}) {
  return (
    <label
      className={`grid gap-2 text-sm font-semibold text-slate-700 ${className}`}
    >
      {label}
      <textarea
        className="rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-emerald-600"
        defaultValue={defaultValue}
        maxLength={maxLength}
        name={name}
        rows={rows}
      />
      {help ? (
        <span className="text-xs font-normal text-slate-500">{help}</span>
      ) : null}
    </label>
  );
}

function Select({
  defaultValue,
  label,
  name,
  options,
}: {
  defaultValue: string;
  label: string;
  name: string;
  options: readonly string[];
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-slate-700">
      {label} *
      <select
        className="min-h-11 rounded-xl border border-slate-300 bg-white px-4 font-normal outline-none focus:border-emerald-600"
        defaultValue={defaultValue}
        name={name}
        required
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
