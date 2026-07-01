import Link from "next/link";
import { notFound } from "next/navigation";

import { ContactRequestAdminForm } from "@/components/admin/ContactRequestAdminForm";
import { getAdminContactRequestById, updateContactRequest } from "@/lib/contact/adminContactRequests";
import { getContactRequestContext } from "@/lib/contact/requestLabels";

export default async function AdminContactRequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const request = await getAdminContactRequestById(id);
  if (!request) notFound();

  const action = updateContactRequest.bind(null, id);
  const context = getContactRequestContext(request);

  return (
    <div>
      <Link className="text-sm font-semibold text-emerald-800" href="/admin/contact-requests">← Demandes</Link>
      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Demande de {request.full_name}</h1>
          <p className="mt-2 text-slate-600">Reçue le {new Date(request.created_at).toLocaleString("fr-FR")}</p>
        </div>
        <a className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white" href={`mailto:${request.email}`}>Répondre par email</a>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-xl font-bold">Informations prospect</h2>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <Info label="Nom" value={request.full_name} />
            <Info label="Email" value={request.email} />
            <Info label="Téléphone" value={request.phone} />
            <Info label="Organisation" value={request.organization} />
            <Info label="Type de demande" value={context.typeLabel} />
            {context.itemPrefix ? <Info label={context.itemPrefix} value={context.itemLabel} /> : null}
            <Info label="Source" value={request.source_page} />
          </dl>
          <div className="mt-6">
            <h2 className="text-xl font-bold">Message</h2>
            <p className="mt-3 whitespace-pre-wrap rounded-2xl bg-slate-50 p-4 text-slate-700">{request.message}</p>
          </div>
        </section>
        <ContactRequestAdminForm action={action} request={request} />
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string | null }) {
  return <div><dt className="font-semibold text-slate-500">{label}</dt><dd className="mt-1 text-slate-900">{value || "—"}</dd></div>;
}
