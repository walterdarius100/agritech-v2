import type { Metadata } from "next";

import { Badge } from "@/components/ui/Badge";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { siteConfig } from "@/config/site";
import { services } from "@/data/services";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createMetadata({ title: "Contacter Agri-tech", path: "/contact" });

export default function ContactPage() {
  return (
    <Section>
      <SectionHeader title="Contacter Agri-tech" description="Présentez votre besoin en service, formation ou accompagnement technique. Le formulaire est visuel pour cette étape et sera connecté plus tard." />
      <div className="mt-10 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <aside className="rounded-3xl bg-emerald-950 p-8 text-white">
          <Badge tone="orange">Coordonnées</Badge>
          <h2 className="mt-5 text-2xl font-bold">Agri-tech / WAL AGRITECH</h2>
          <p className="mt-4 text-emerald-50">Services techniques, formations pratiques et contenus éducatifs agricoles en Haïti.</p>
          <a className="mt-6 block font-semibold text-orange-200" href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>
          <p className="mt-2 text-sm text-emerald-100">{siteConfig.url}</p>
        </aside>
        <form className="grid gap-4 rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-2"><Field label="Nom complet" placeholder="Votre nom" /><Field label="Email" type="email" placeholder="vous@example.com" /></div>
          <div className="grid gap-4 sm:grid-cols-2"><Field label="Téléphone" placeholder="+509 ..." /><Field label="Type de demande" placeholder="Service, formation, conseil" /></div>
          <label className="grid gap-2 text-sm font-semibold text-emerald-950">Domaine concerné<select className="rounded-2xl border border-slate-200 px-4 py-3 font-normal text-slate-700 outline-none focus:border-emerald-600"><option>Choisir un domaine</option>{services.map((service) => <option key={service.slug}>{service.title}</option>)}</select></label>
          <label className="grid gap-2 text-sm font-semibold text-emerald-950">Message<textarea rows={6} placeholder="Décrivez votre projet ou votre besoin" className="rounded-2xl border border-slate-200 px-4 py-3 font-normal text-slate-700 outline-none focus:border-emerald-600" /></label>
          <p className="rounded-2xl bg-emerald-50 p-4 text-sm text-slate-600">Envoi désactivé pour cette étape : aucune donnée n’est transmise à EmailJS ou Supabase.</p>
        </form>
      </div>
    </Section>
  );
}

function Field({ label, type = "text", placeholder }: { label: string; type?: string; placeholder: string }) {
  return <label className="grid gap-2 text-sm font-semibold text-emerald-950">{label}<input type={type} placeholder={placeholder} className="rounded-2xl border border-slate-200 px-4 py-3 font-normal text-slate-700 outline-none focus:border-emerald-600" /></label>;
}
