"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/Button";
import { services } from "@/data/services";
import { getFormationLabel, getServiceLabel } from "@/lib/contact/requestLabels";
import type { ContactRequestType } from "@/types/contact";

type ContactFormProps = {
  serviceSlug?: string;
  formationSlug?: string;
};

type SubmitState = { type: "idle" | "success" | "error"; message?: string };

const requestTypeOptions: { label: string; value: ContactRequestType }[] = [
  { label: "Demande générale", value: "general" },
  { label: "Service technique", value: "service" },
  { label: "Formation", value: "formation" },
  { label: "Partenariat", value: "partnership" },
  { label: "Autre demande", value: "other" },
];

export function ContactForm({ serviceSlug = "", formationSlug = "" }: ContactFormProps) {
  // Quand les deux paramètres sont présents, le service est prioritaire afin de garder une seule origine claire.
  const selectedServiceSlug = serviceSlug || "";
  const selectedFormationSlug = selectedServiceSlug ? "" : formationSlug || "";
  const initialRequestType: ContactRequestType = selectedServiceSlug
    ? "service"
    : selectedFormationSlug
      ? "formation"
      : "general";
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitState, setSubmitState] = useState<SubmitState>({ type: "idle" });
  const [requestType, setRequestType] = useState<ContactRequestType>(initialRequestType);

  const sourcePage = useMemo(() => {
    const params = new URLSearchParams();
    if (selectedServiceSlug) params.set("service", selectedServiceSlug);
    if (selectedFormationSlug) params.set("formation", selectedFormationSlug);
    const query = params.toString();
    return query ? `/contact?${query}` : "/contact";
  }, [selectedFormationSlug, selectedServiceSlug]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    const message = String(formData.get("message") ?? "").trim();
    const fullName = String(formData.get("full_name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();

    if (!fullName || !email || !message) {
      setSubmitState({ type: "error", message: "Veuillez renseigner votre nom, votre email et votre message." });
      return;
    }

    setIsSubmitting(true);
    setSubmitState({ type: "idle" });

    const payload = Object.fromEntries(formData.entries());

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as { ok?: boolean; message?: string };

      if (!response.ok || !data.ok) {
        throw new Error(data.message || "Une erreur est survenue.");
      }

      form.reset();
      setRequestType(initialRequestType);
      setSubmitState({
        type: "success",
        message: "Votre demande a bien été envoyée. L’équipe Agri-tech vous répondra dès que possible.",
      });
    } catch {
      setSubmitState({
        type: "error",
        message: "Une erreur est survenue. Veuillez réessayer ou nous contacter par un autre moyen.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
      <input aria-hidden="true" autoComplete="off" className="hidden" name="company_website" tabIndex={-1} type="text" />
      <input name="service_slug" type="hidden" value={selectedServiceSlug} />
      <input name="formation_slug" type="hidden" value={selectedFormationSlug} />
      <input name="source_page" type="hidden" value={sourcePage} />

      {initialRequestType !== "general" ? (
        <p className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900">
          {initialRequestType === "service"
            ? `Demande liée au service : ${getServiceLabel(selectedServiceSlug) ?? selectedServiceSlug}`
            : `Demande liée à la formation : ${getFormationLabel(selectedFormationSlug) ?? selectedFormationSlug}`}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nom complet" maxLength={120} name="full_name" placeholder="Votre nom" required />
        <Field label="Email" maxLength={180} name="email" placeholder="vous@example.com" required type="email" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Téléphone" maxLength={40} name="phone" placeholder="+509 ..." type="tel" />
        <Field label="Organisation / entreprise" maxLength={180} name="organization" placeholder="Nom de votre structure" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Select label="Type de demande" name="request_type" onChange={(value) => setRequestType(value as ContactRequestType)} options={requestTypeOptions} value={requestType} />
        <Select label="Domaine concerné" name="subject" options={services.map((service) => ({ label: service.title, value: service.title }))} placeholder="Choisir si applicable" />
      </div>
      <label className="grid gap-2 text-sm font-semibold text-emerald-950">
        Message
        <textarea
          className="rounded-2xl border border-slate-200 px-4 py-3 font-normal text-slate-700 outline-none focus:border-emerald-600"
          maxLength={3000}
          name="message"
          placeholder="Décrivez votre projet, votre localisation, votre objectif et vos contraintes"
          required
          rows={6}
        />
      </label>
      <label className="flex gap-3 text-sm text-slate-600"><input required type="checkbox" className="mt-1 size-4 accent-emerald-700" />J’accepte d’être recontacté par Agri-tech au sujet de ma demande.</label>
      <Button disabled={isSubmitting} type="submit" variant="secondary" className="w-fit">
        {isSubmitting ? "Envoi en cours..." : "Demander une consultation"}
      </Button>
      {submitState.message ? <p className={`rounded-2xl p-4 text-sm ${submitState.type === "success" ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700"}`}>{submitState.message}</p> : null}
    </form>
  );
}

function Field({ label, name, type = "text", placeholder, required = false, maxLength }: { label: string; name: string; type?: string; placeholder: string; required?: boolean; maxLength: number }) {
  return <label className="grid gap-2 text-sm font-semibold text-emerald-950">{label}<input maxLength={maxLength} name={name} required={required} type={type} placeholder={placeholder} className="rounded-2xl border border-slate-200 px-4 py-3 font-normal text-slate-700 outline-none focus:border-emerald-600" /></label>;
}
function Select({ label, name, options, placeholder, value, onChange }: { label: string; name: string; options: { label: string; value: string }[]; placeholder?: string; value?: string; onChange?: (value: string) => void }) {
  return <label className="grid gap-2 text-sm font-semibold text-emerald-950">{label}<select name={name} value={value} onChange={(event) => onChange?.(event.target.value)} className="rounded-2xl border border-slate-200 px-4 py-3 font-normal text-slate-700 outline-none focus:border-emerald-600">{placeholder ? <option value="">{placeholder}</option> : null}{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>;
}
