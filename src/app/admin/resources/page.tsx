import Link from "next/link";

import { CopyResourceLinkButton } from "@/components/admin/CopyResourceLinkButton";
import { env } from "@/lib/env";
import {
  getAdminEventResources,
  toggleEventResourceStatus,
} from "@/lib/event-resources/adminResources";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "short" }).format(
    new Date(value),
  );
}

export default async function AdminResourcesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const { resources, stats } = await getAdminEventResources();
  const success = typeof params.success === "string";
  const error = typeof params.error === "string";
  const cards = [
    ["Total ressources", stats.totalResources],
    ["Ressources actives", stats.activeResources],
    ["Total leads", stats.totalLeads],
    ["Leads aujourd’hui", stats.todayLeads],
  ];

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Ressources événementielles</h1>
          <p className="mt-2 text-slate-600">
            Gérez les liens distribués par QR code et consultez les contacts
            collectés.
          </p>
        </div>
        <Link
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-emerald-700 px-5 font-bold text-white hover:bg-emerald-800"
          href="/admin/resources/new"
        >
          Nouvelle ressource
        </Link>
      </div>

      {success ? (
        <p
          className="mt-6 rounded-xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-800"
          role="status"
        >
          L’opération a été enregistrée.
        </p>
      ) : null}
      {error ? (
        <p
          className="mt-6 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-800"
          role="alert"
        >
          L’opération n’a pas pu être enregistrée.
        </p>
      ) : null}

      <section
        className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        aria-label="Statistiques des ressources"
      >
        {cards.map(([label, value]) => (
          <div
            className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"
            key={label}
          >
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-2 text-3xl font-bold text-slate-950">{value}</p>
          </div>
        ))}
      </section>

      <div className="mt-6 overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <table className="min-w-[1500px] text-left text-sm">
          <thead className="whitespace-nowrap bg-slate-100 text-slate-600">
            <tr>
              <th className="p-4">Titre</th>
              <th>Slug</th>
              <th>Type</th>
              <th>Événement</th>
              <th>Sujet</th>
              <th>Langue</th>
              <th>Statut</th>
              <th>Leads</th>
              <th>Création</th>
              <th>Lien QR / page</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {resources.map((resource) => {
              const publicUrl = new URL(
                `/r/${resource.slug}`,
                env.siteUrl,
              ).toString();
              return (
                <tr className="border-t border-slate-100" key={resource.id}>
                  <td
                    className="max-w-[220px] truncate p-4 font-semibold"
                    title={resource.title}
                  >
                    {resource.title}
                  </td>
                  <td
                    className="max-w-[180px] truncate font-mono text-xs"
                    title={resource.slug}
                  >
                    {resource.slug}
                  </td>
                  <td className="whitespace-nowrap">
                    <Badge>{resource.resource_type}</Badge>
                  </td>
                  <td
                    className="max-w-[200px] truncate"
                    title={resource.event_name ?? undefined}
                  >
                    {resource.event_name ?? "—"}
                  </td>
                  <td
                    className="max-w-[200px] truncate"
                    title={resource.topic ?? undefined}
                  >
                    {resource.topic ?? "—"}
                  </td>
                  <td className="whitespace-nowrap">
                    <Badge>{resource.language.toUpperCase()}</Badge>
                  </td>
                  <td className="whitespace-nowrap">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-bold ${resource.is_active ? "bg-emerald-50 text-emerald-800" : "bg-slate-100 text-slate-600"}`}
                    >
                      {resource.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="whitespace-nowrap font-bold">
                    {resource.lead_count}
                  </td>
                  <td className="whitespace-nowrap">
                    {formatDate(resource.created_at)}
                  </td>
                  <td className="whitespace-nowrap">
                    <div className="flex gap-3">
                      <a
                        className="font-semibold text-slate-700 hover:text-emerald-800"
                        href={publicUrl}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        Ouvrir
                      </a>
                      <CopyResourceLinkButton url={publicUrl} />
                    </div>
                  </td>
                  <td className="whitespace-nowrap">
                    <div className="flex gap-3">
                      <Link
                        className="font-semibold text-emerald-800"
                        href={`/admin/resources/${resource.id}#leads`}
                      >
                        Voir leads
                      </Link>
                      <Link
                        className="font-semibold text-slate-700"
                        href={`/admin/resources/${resource.id}`}
                      >
                        Modifier
                      </Link>
                      <form action={toggleEventResourceStatus}>
                        <input name="id" type="hidden" value={resource.id} />
                        <input
                          name="next_active"
                          type="hidden"
                          value={String(!resource.is_active)}
                        />
                        <button
                          className={
                            resource.is_active
                              ? "font-semibold text-red-700"
                              : "font-semibold text-emerald-700"
                          }
                          type="submit"
                        >
                          {resource.is_active ? "Désactiver" : "Activer"}
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              );
            })}
            {resources.length === 0 ? (
              <tr>
                <td className="p-8 text-center text-slate-500" colSpan={11}>
                  Aucune ressource événementielle.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
      {children}
    </span>
  );
}
