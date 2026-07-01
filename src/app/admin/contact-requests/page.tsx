import Link from "next/link";

import { getAdminContactRequests } from "@/lib/contact/adminContactRequests";
import { getContactRequestContext } from "@/lib/contact/requestLabels";

export default async function AdminContactRequestsPage() {
  const requests = await getAdminContactRequests();

  return (
    <div>
      <div>
        <h1 className="text-3xl font-bold">Demandes clients</h1>
        <p className="mt-2 text-slate-600">Suivi minimal des demandes reçues depuis le formulaire Contact.</p>
      </div>
      <div className="mt-6 overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-slate-100 text-slate-600"><tr><th className="p-4">Date</th><th>Nom</th><th>Email</th><th>Type</th><th>Sujet</th><th>Statut</th><th>Priorité</th><th>Action</th></tr></thead>
          <tbody>{requests.map((request) => {
            const context = getContactRequestContext(request);

            return (
              <tr className="border-t border-slate-100" key={request.id}>
                <td className="p-4">{new Date(request.created_at).toLocaleDateString("fr-FR")}</td>
                <td className="font-semibold">{request.full_name}</td>
                <td>{request.email}</td>
                <td className="font-medium text-slate-800">{context.summary}</td>
                <td>{request.subject ?? "—"}</td>
                <td>{request.status}</td>
                <td>{request.priority}</td>
                <td><Link className="font-semibold text-emerald-800" href={`/admin/contact-requests/${request.id}`}>Voir</Link></td>
              </tr>
            );
          })}</tbody>
        </table>
        {requests.length === 0 ? <p className="p-6 text-slate-500">Aucune demande reçue pour le moment.</p> : null}
      </div>
    </div>
  );
}
