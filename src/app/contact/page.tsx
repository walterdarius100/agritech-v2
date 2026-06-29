import { CheckCircle2 } from "lucide-react";
import type { Metadata } from "next";

import { ContactFormShell } from "@/components/contact/ContactFormShell";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createMetadata({ title: "Contacter Agri-tech", path: "/contact" });

const reassurancePoints = [
  "Réponse généralement envoyée sous 24 à 48 heures ouvrables.",
  "Analyse préliminaire de votre besoin avant toute proposition.",
  "Orientation claire vers le service, la formation ou l’accompagnement adapté.",
  "Échange possible pour préciser les informations importantes avant la prochaine étape.",
];

export default function ContactPage() {
  return (
    <>
      <section className="bg-emerald-950 py-14 text-white sm:py-18">
        <Container>
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-yellow-400">Contact</p>
            <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl">Parlons de votre projet agricole.</h1>
            <p className="mt-6 text-lg leading-8 text-emerald-50">
              Expliquez-nous votre besoin, votre idée ou votre situation actuelle. L’équipe Agri-tech vous répondra avec une orientation claire pour avancer de manière structurée.
            </p>
          </div>
        </Container>
      </section>
      <Section>
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
          <ContactFormShell />
          <aside className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm sm:p-8">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-emerald-700">Suivi de votre demande</p>
            <h2 className="mt-4 text-2xl font-bold text-emerald-950">Ce qui se passe après votre message</h2>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Chaque demande est lue avec attention afin de comprendre le contexte du projet, le niveau d’urgence et le type d’accompagnement nécessaire.
            </p>
            <ul className="mt-6 space-y-4 text-sm leading-6 text-slate-700">
              {reassurancePoints.map((point) => (
                <li key={point} className="flex gap-3">
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-700" aria-hidden="true" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </Section>
    </>
  );
}
