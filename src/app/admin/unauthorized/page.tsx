import { logoutAdmin } from "@/lib/auth/actions";
import { getCurrentAdminUser } from "@/lib/auth/adminAuth";

export default async function UnauthorizedPage() {
  const { user } = await getCurrentAdminUser();
  return <div className="mx-auto max-w-2xl rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200"><h1 className="text-2xl font-bold text-slate-900">Accès non autorisé</h1><p className="mt-3 text-slate-600">Votre compte{user?.email ? ` ${user.email}` : ""} n’est pas autorisé à accéder à l’administration Agri-tech.</p><form action={logoutAdmin} className="mt-6"><button className="rounded-xl bg-emerald-700 px-5 py-3 font-semibold text-white">Se déconnecter</button></form></div>;
}
