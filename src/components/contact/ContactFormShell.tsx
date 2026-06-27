import { Button } from "@/components/ui/Button";
import { services } from "@/data/services";

export function ContactFormShell() {
  return (
    <form className="grid gap-4 rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
      <div className="grid gap-4 sm:grid-cols-2"><Field label="Nom complet" placeholder="Votre nom" /><Field label="Email" type="email" placeholder="vous@example.com" /></div>
      <div className="grid gap-4 sm:grid-cols-2"><Field label="Téléphone" placeholder="+509 ..." /><Select label="Type de demande" options={["Service technique", "Formation", "Partenariat", "Conseil"]} /></div>
      <Select label="Domaine concerné" options={services.map((service) => service.title)} />
      <label className="grid gap-2 text-sm font-semibold text-emerald-950">Message<textarea rows={6} placeholder="Décrivez votre projet, votre localisation, votre objectif et vos contraintes" className="rounded-2xl border border-slate-200 px-4 py-3 font-normal text-slate-700 outline-none focus:border-emerald-600" /></label>
      <label className="flex gap-3 text-sm text-slate-600"><input type="checkbox" className="mt-1 size-4 accent-emerald-700" />J’accepte d’être recontacté par Agri-tech au sujet de ma demande.</label>
      <Button type="button" variant="secondary" className="w-fit">Demander une consultation</Button>
      <p className="rounded-2xl bg-emerald-50 p-4 text-sm text-slate-600">Formulaire non connecté pour cette étape : aucune donnée n’est envoyée à EmailJS ou Supabase.</p>
    </form>
  );
}

function Field({ label, type = "text", placeholder }: { label: string; type?: string; placeholder: string }) {
  return <label className="grid gap-2 text-sm font-semibold text-emerald-950">{label}<input type={type} placeholder={placeholder} className="rounded-2xl border border-slate-200 px-4 py-3 font-normal text-slate-700 outline-none focus:border-emerald-600" /></label>;
}
function Select({ label, options }: { label: string; options: string[] }) {
  return <label className="grid gap-2 text-sm font-semibold text-emerald-950">{label}<select className="rounded-2xl border border-slate-200 px-4 py-3 font-normal text-slate-700 outline-none focus:border-emerald-600"><option>Choisir</option>{options.map((option) => <option key={option}>{option}</option>)}</select></label>;
}
