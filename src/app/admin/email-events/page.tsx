import { requireAuthorizedAdmin } from "@/lib/auth/adminAuth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

const statuses = ["sent", "failed", "skipped"];

function formatDate(value: string) {
  return new Date(value).toLocaleString("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export default async function AdminEmailEventsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; module?: string; type?: string }>;
}) {
  await requireAuthorizedAdmin();
  const params = await searchParams;
  const supabase = createSupabaseAdminClient();

  let query = supabase
    ?.from("email_events")
    .select(
      "id,created_at,event_type,recipient_email,recipient_name,subject,status,related_entity_type,related_entity_id,provider,provider_message_id,metadata",
    )
    .order("created_at", { ascending: false })
    .limit(100);

  if (params.status && statuses.includes(params.status))
    query = query?.eq("status", params.status);
  if (params.type) query = query?.eq("event_type", params.type);
  if (params.module) query = query?.eq("metadata->>module", params.module);

  const { data: events, error } = query
    ? await query
    : { data: [], error: null };

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Historique des emails</h1>
          <p className="mt-2 text-slate-600">
            Derniers emails transactionnels Brevo enregistrés côté serveur.
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <a
          className="rounded-xl bg-white px-3 py-2 text-sm font-semibold ring-1 ring-slate-200"
          href="/admin/email-events"
        >
          Tous
        </a>
        {statuses.map((status) => (
          <a
            className="rounded-xl bg-white px-3 py-2 text-sm font-semibold ring-1 ring-slate-200"
            href={`/admin/email-events?status=${status}`}
            key={status}
          >
            {status}
          </a>
        ))}
        {["consultation", "contact", "academy"].map((module) => (
          <a
            className="rounded-xl bg-white px-3 py-2 text-sm font-semibold ring-1 ring-slate-200"
            href={`/admin/email-events?module=${module}`}
            key={module}
          >
            {module}
          </a>
        ))}
      </div>

      {error ? (
        <p className="mt-6 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-800">
          Impossible de charger l’historique : {error.message}
        </p>
      ) : null}

      <div className="mt-6 overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <table className="min-w-[1100px] text-left text-sm">
          <thead className="whitespace-nowrap bg-slate-50 text-slate-600">
            <tr>
              <th className="p-3">Date</th>
              <th className="p-3">Type</th>
              <th className="p-3">Destinataire</th>
              <th className="p-3">Sujet</th>
              <th className="p-3">Statut</th>
              <th className="p-3">Module lié</th>
              <th className="p-3">Provider</th>
              <th className="p-3">MessageId</th>
            </tr>
          </thead>
          <tbody>
            {(events ?? []).map((event) => {
              const metadata = event.metadata as { module?: string } | null;
              return (
                <tr className="border-t" key={event.id}>
                  <td className="p-3 whitespace-nowrap">
                    {formatDate(event.created_at)}
                  </td>
                  <td className="whitespace-nowrap p-3 font-mono text-xs">{event.event_type}</td>
                  <td className="max-w-[260px] truncate whitespace-nowrap p-3" title={`${event.recipient_name ? `${event.recipient_name} — ` : ""}${event.recipient_email}`}>
                    {event.recipient_name ? `${event.recipient_name} — ` : ""}
                    {event.recipient_email}
                  </td>
                  <td className="max-w-[300px] truncate whitespace-nowrap p-3" title={event.subject}>{event.subject}</td>
                  <td className="whitespace-nowrap p-3">
                    <span className="inline-flex whitespace-nowrap rounded-full bg-emerald-50 px-2 py-1 font-bold text-emerald-800">
                      {event.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap p-3">
                    {metadata?.module ?? event.related_entity_type ?? "—"}
                  </td>
                  <td className="whitespace-nowrap p-3">{event.provider}</td>
                  <td className="max-w-[220px] truncate whitespace-nowrap p-3 font-mono text-xs" title={event.provider_message_id ?? undefined}>
                    {event.provider_message_id ?? "—"}
                  </td>
                </tr>
              );
            })}
            {(events ?? []).length === 0 ? (
              <tr>
                <td className="p-6 text-slate-500" colSpan={8}>
                  Aucun événement email.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
