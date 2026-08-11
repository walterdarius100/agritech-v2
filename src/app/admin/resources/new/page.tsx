import Link from "next/link";

import { EventResourceForm } from "@/components/admin/EventResourceForm";
import { requireAuthorizedAdmin } from "@/lib/auth/adminAuth";
import {
  createEventResource,
  getEventResourceFormDefaults,
} from "@/lib/event-resources/adminResources";

export default async function NewEventResourcePage() {
  await requireAuthorizedAdmin();
  return (
    <div>
      <Link
        className="text-sm font-semibold text-emerald-800"
        href="/admin/resources"
      >
        ← Ressources
      </Link>
      <h1 className="mt-4 text-3xl font-bold">Nouvelle ressource</h1>
      <p className="mt-2 text-slate-600">
        Créez le contenu qui sera accessible depuis un lien court ou un QR code.
      </p>
      <div className="mt-6">
        <EventResourceForm
          action={createEventResource}
          defaults={getEventResourceFormDefaults()}
          submitLabel="Créer la ressource"
        />
      </div>
    </div>
  );
}
