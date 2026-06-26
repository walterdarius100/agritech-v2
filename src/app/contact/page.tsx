import type { Metadata } from "next";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { siteConfig } from "@/config/site";
import { services } from "@/data/services";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createMetadata({ title: "Contacter Agri-tech", description: "Contactez Agri-tech pour une consultation, un service agricole ou une formation en Haïti.", path: "/contact" });

const requestTypes = ["Consultation", "Service technique", "Formation", "Partenariat", "Autre"];

export default function ContactPage() {
  return (
    <Section>
      <SectionHeader title="Contacter Agri-tech" description="Présentez votre besoin. Le formulaire est visuel pour cette phase et sera connecté aux leads plus tard." />
      <div className="mt-10 grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
        <Card as="div"><h2 className="text-xl font-bold text-emerald-950">Coordonnées</h2><p className="mt-3 text-sm leading-6 text-slate-600">Pour les demandes de services, formations ou accompagnement technique.</p><a className="mt-4 inline-block font-semibold text-emerald-700 hover:text-emerald-900" href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a><p className="mt-6 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-900">Aucune donnée n'est encore envoyée : Supabase ou EmailJS ne sont pas connectés dans cette étape.</p></Card>
        <Card as="div">
          <form className="grid gap-4" aria-label="Formulaire de contact statique">
            <div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-semibold text-slate-700">Nom<input className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500" placeholder="Votre nom" /></label><label className="text-sm font-semibold text-slate-700">Email<input type="email" className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500" placeholder="vous@email.com" /></label></div>
            <div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-semibold text-slate-700">Téléphone<input className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500" placeholder="+509 ..." /></label><label className="text-sm font-semibold text-slate-700">Type de demande<select className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500">{requestTypes.map((type) => <option key={type}>{type}</option>)}</select></label></div>
            <label className="text-sm font-semibold text-slate-700">Domaine concerné<select className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500">{services.map((service) => <option key={service.slug}>{service.title}</option>)}</select></label>
            <label className="text-sm font-semibold text-slate-700">Message<textarea className="mt-2 min-h-36 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500" placeholder="Décrivez votre projet ou votre besoin" /></label>
            <Button type="button" variant="secondary">Envoyer bientôt</Button>
          </form>
        </Card>
      </div>
    </Section>
  );
}
