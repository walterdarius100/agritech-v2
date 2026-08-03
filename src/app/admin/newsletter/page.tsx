import Link from "next/link";

import {
  getNewsletterAdminData,
  normalizeNewsletterFilters,
  updateNewsletterSubscriberStatus,
  type NewsletterStatus,
} from "@/lib/newsletter/adminNewsletter";

type NewsletterAdminPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const statusLabels: Record<NewsletterStatus, string> = {
  active: "Actif",
  unsubscribed: "Désinscrit",
  bounced: "Rebond",
  complained: "Signalé",
};

const statusStyles: Record<NewsletterStatus, string> = {
  active: "bg-emerald-50 text-emerald-800",
  unsubscribed: "bg-slate-100 text-slate-700",
  bounced: "bg-amber-50 text-amber-800",
  complained: "bg-red-50 text-red-800",
};

const filterOptions: { label: string; value: NewsletterStatus | "all" }[] = [
  { label: "Tous", value: "all" },
  { label: "Actifs", value: "active" },
  { label: "Désinscrits", value: "unsubscribed" },
  { label: "Bounced", value: "bounced" },
  { label: "Signalés", value: "complained" },
];

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function filterHref(status: NewsletterStatus | "all", query?: string) {
  const params = new URLSearchParams();
  if (status !== "all") params.set("status", status);
  if (query) params.set("q", query);
  const search = params.toString();
  return search ? `/admin/newsletter?${search}` : "/admin/newsletter";
}

export default async function NewsletterAdminPage({
  searchParams,
}: NewsletterAdminPageProps) {
  const rawParams = await searchParams;
  const filters = normalizeNewsletterFilters(rawParams);
  const { subscribers, stats } = await getNewsletterAdminData(filters);
  const success = rawParams.success === "statut-mis-a-jour";
  const error = typeof rawParams.error === "string";
  const statCards = [
    { label: "Total abonnés", value: stats.total },
    { label: "Actifs", value: stats.active },
    { label: "Désinscrits", value: stats.unsubscribed },
    { label: "Rebonds", value: stats.bounced },
    { label: "Signalés", value: stats.complained },
  ];

  return (
    <div>
      <div>
        <h1 className="text-3xl font-bold">Newsletter</h1>
        <p className="mt-2 text-slate-600">
          Consultez les inscriptions du footer et gérez leur statut. Aucun email
          n’est envoyé depuis cette page.
        </p>
      </div>

      {success ? (
        <p className="mt-6 rounded-xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-800" role="status">
          Le statut de l’abonné a été mis à jour.
        </p>
      ) : null}
      {error ? (
        <p className="mt-6 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-800" role="alert">
          La mise à jour n’a pas pu être effectuée. Veuillez réessayer.
        </p>
      ) : null}

      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5" aria-label="Statistiques Newsletter">
        {statCards.map((stat) => (
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200" key={stat.label}>
            <p className="text-sm text-slate-500">{stat.label}</p>
            <p className="mt-2 text-3xl font-bold text-slate-950">{stat.value}</p>
          </div>
        ))}
      </section>

      <form action="/admin/newsletter" className="mt-6 flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:flex-row sm:items-end">
        <label className="grid flex-1 gap-2 text-sm font-semibold text-slate-700">
          Rechercher par email
          <input
            className="min-h-11 rounded-xl border border-slate-200 px-4 font-normal outline-none focus:border-emerald-600"
            defaultValue={filters.query}
            maxLength={254}
            name="q"
            placeholder="abonne@example.com"
            type="search"
          />
        </label>
        {filters.status !== "all" ? <input name="status" type="hidden" value={filters.status} /> : null}
        <button className="min-h-11 rounded-xl bg-emerald-700 px-5 text-sm font-bold text-white hover:bg-emerald-800" type="submit">
          Rechercher
        </button>
        <Link className="inline-flex min-h-11 items-center justify-center rounded-xl bg-slate-100 px-5 text-sm font-bold text-slate-700" href="/admin/newsletter">
          Réinitialiser
        </Link>
      </form>

      <div className="mt-6 flex flex-wrap gap-2" aria-label="Filtres de statut">
        {filterOptions.map((option) => (
          <Link
            className={`rounded-full px-4 py-2 text-sm font-semibold ${filters.status === option.value ? "bg-emerald-700 text-white" : "bg-white text-slate-700 ring-1 ring-slate-200"}`}
            href={filterHref(option.value, filters.query)}
            key={option.value}
          >
            {option.label}
          </Link>
        ))}
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <table className="min-w-[1180px] text-left text-sm">
          <thead className="whitespace-nowrap bg-slate-100 text-slate-600">
            <tr>
              <th className="p-4">Email</th>
              <th className="p-4">Statut</th>
              <th className="p-4">Source</th>
              <th className="p-4">Page d’inscription</th>
              <th className="p-4">Date d’inscription</th>
              <th className="p-4">Date de désinscription</th>
              <th className="p-4">Dernière mise à jour</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {subscribers.map((subscriber) => (
              <tr className="border-t border-slate-100" key={subscriber.id}>
                <td className="max-w-[280px] truncate whitespace-nowrap p-4 font-semibold" title={subscriber.email}>{subscriber.email}</td>
                <td className="whitespace-nowrap p-4">
                  <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${statusStyles[subscriber.status]}`}>
                    {statusLabels[subscriber.status]}
                  </span>
                </td>
                <td className="whitespace-nowrap p-4">{subscriber.source}</td>
                <td className="max-w-[240px] truncate whitespace-nowrap p-4" title={subscriber.page_path ?? undefined}>{subscriber.page_path ?? "—"}</td>
                <td className="whitespace-nowrap p-4">{formatDate(subscriber.subscribed_at)}</td>
                <td className="whitespace-nowrap p-4">{formatDate(subscriber.unsubscribed_at)}</td>
                <td className="whitespace-nowrap p-4">{formatDate(subscriber.updated_at)}</td>
                <td className="whitespace-nowrap p-4">
                  {subscriber.status === "active" || subscriber.status === "unsubscribed" ? (
                    <form action={updateNewsletterSubscriberStatus}>
                      <input name="id" type="hidden" value={subscriber.id} />
                      <input name="currentStatus" type="hidden" value={subscriber.status} />
                      <input name="nextStatus" type="hidden" value={subscriber.status === "active" ? "unsubscribed" : "active"} />
                      <button className={`font-semibold ${subscriber.status === "active" ? "text-red-700" : "text-emerald-700"}`} type="submit">
                        {subscriber.status === "active" ? "Marquer comme désinscrit" : "Réactiver"}
                      </button>
                    </form>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>
              </tr>
            ))}
            {subscribers.length === 0 ? (
              <tr>
                <td className="p-8 text-center text-slate-500" colSpan={8}>
                  <span className="block font-semibold text-slate-700">Aucun abonné Newsletter pour le moment.</span>
                  <span className="mt-1 block">Les inscriptions depuis le footer apparaîtront ici.</span>
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      {subscribers.length === 500 ? (
        <p className="mt-3 text-sm text-slate-500">Seuls les 500 résultats les plus récents sont affichés. Affinez la recherche ou le filtre.</p>
      ) : null}
    </div>
  );
}
