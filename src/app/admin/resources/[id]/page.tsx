import Link from "next/link";
import { notFound } from "next/navigation";

import { CopyResourceLinkButton } from "@/components/admin/CopyResourceLinkButton";
import { EventResourceForm } from "@/components/admin/EventResourceForm";
import { env } from "@/lib/env";
import {
  getAdminEventResourceById,
  getAdminEventResourceLeads,
  getEventResourceFormDefaults,
  updateEventResource,
} from "@/lib/event-resources/adminResources";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function EventResourceDetailPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const queryParams = await searchParams;
  const query = typeof queryParams.q === "string" ? queryParams.q : undefined;
  const resource = await getAdminEventResourceById(id);
  if (!resource) notFound();
  const { leads, total: totalLeads } = await getAdminEventResourceLeads(
    id,
    query,
  );
  const action = updateEventResource.bind(null, id);
  const publicUrl = new URL(`/r/${resource.slug}`, env.siteUrl).toString();

  return (
    <div>
      <Link
        className="text-sm font-semibold text-emerald-800"
        href="/admin/resources"
      >
        ← Ressources
      </Link>
      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Modifier la ressource</h1>
          <p className="mt-2 text-slate-600">{resource.title}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <a
            className="inline-flex min-h-11 items-center rounded-xl bg-slate-100 px-4 font-semibold text-slate-700"
            href={publicUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            Ouvrir la page
          </a>
          <span className="inline-flex min-h-11 items-center rounded-xl bg-emerald-50 px-4">
            <CopyResourceLinkButton url={publicUrl} />
          </span>
        </div>
      </div>
      {queryParams.success ? (
        <p className="mt-6 rounded-xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
          La ressource a été mise à jour.
        </p>
      ) : null}
      <div className="mt-6">
        <EventResourceForm
          action={action}
          defaults={getEventResourceFormDefaults(resource)}
          submitLabel="Mettre à jour"
        />
      </div>

      <section className="mt-10 scroll-mt-24" id="leads">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold">Leads associés</h2>
            <p className="mt-1 text-slate-600">
              {totalLeads} lead{totalLeads > 1 ? "s" : ""} au total.{" "}
              {leads.length} résultat{leads.length > 1 ? "s" : ""} affiché
              {leads.length > 1 ? "s" : ""}
              {leads.length === 500 ? " parmi les 500 plus récents" : ""}.
            </p>
          </div>
        </div>
        <form
          action={`/admin/resources/${id}`}
          className="mt-5 flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:flex-row"
        >
          <input
            className="min-h-11 flex-1 rounded-xl border border-slate-300 px-4"
            defaultValue={query}
            maxLength={180}
            name="q"
            placeholder="Nom, email, téléphone ou organisation"
            type="search"
          />
          <button
            className="min-h-11 rounded-xl bg-emerald-700 px-5 font-bold text-white"
            type="submit"
          >
            Rechercher
          </button>
          <Link
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-slate-100 px-5 font-bold text-slate-700"
            href={`/admin/resources/${id}#leads`}
          >
            Réinitialiser
          </Link>
        </form>
        <div className="mt-5 overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          <table className="min-w-[1150px] text-left text-sm">
            <thead className="whitespace-nowrap bg-slate-100 text-slate-600">
              <tr>
                <th className="p-4">Nom</th>
                <th>Téléphone</th>
                <th>Email</th>
                <th>Organisation</th>
                <th>Domaine d’intérêt</th>
                <th>Newsletter</th>
                <th>Source</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr className="border-t border-slate-100" key={lead.id}>
                  <td
                    className="max-w-[220px] truncate p-4 font-semibold"
                    title={lead.full_name}
                  >
                    {lead.full_name}
                  </td>
                  <td className="whitespace-nowrap">{lead.phone ?? "—"}</td>
                  <td className="max-w-[260px] truncate" title={lead.email}>
                    {lead.email}
                  </td>
                  <td
                    className="max-w-[220px] truncate"
                    title={lead.organization ?? undefined}
                  >
                    {lead.organization ?? "—"}
                  </td>
                  <td
                    className="max-w-[220px] truncate"
                    title={lead.interest_area ?? undefined}
                  >
                    {lead.interest_area ?? "—"}
                  </td>
                  <td className="whitespace-nowrap">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-bold ${lead.consent_newsletter ? "bg-emerald-50 text-emerald-800" : "bg-slate-100 text-slate-600"}`}
                    >
                      {lead.consent_newsletter ? "Oui" : "Non"}
                    </span>
                  </td>
                  <td className="whitespace-nowrap">{lead.source}</td>
                  <td className="whitespace-nowrap">
                    {formatDate(lead.created_at)}
                  </td>
                </tr>
              ))}
              {leads.length === 0 ? (
                <tr>
                  <td className="p-8 text-center text-slate-500" colSpan={8}>
                    Aucun lead trouvé pour cette ressource.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
