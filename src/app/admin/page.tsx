import Link from "next/link";
import { getAdminArticleStats } from "@/lib/articles/adminArticles";

export default async function AdminPage() {
  const stats = await getAdminArticleStats();
  return <div><h1 className="text-3xl font-bold">Dashboard</h1><div className="mt-6 grid gap-4 md:grid-cols-4">{Object.entries(stats).map(([label, value]) => <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200" key={label}><p className="text-sm capitalize text-slate-500">{label}</p><p className="mt-2 text-3xl font-bold">{value}</p></div>)}</div><Link className="mt-8 inline-flex rounded-xl bg-emerald-700 px-5 py-3 font-semibold text-white" href="/admin/articles">Gérer les articles</Link></div>;
}
