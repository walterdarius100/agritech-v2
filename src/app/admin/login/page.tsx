import Link from "next/link";
import { LoginForm } from "@/components/admin/LoginForm";

export default function AdminLoginPage() {
  return <main className="min-h-screen bg-emerald-950 px-4 py-16"><div className="mx-auto max-w-md"><Link className="text-sm font-semibold text-emerald-100" href="/">← Retour au site</Link><div className="my-8 text-white"><h1 className="text-3xl font-bold">Connexion admin</h1><p className="mt-3 text-emerald-100">Accès réservé aux administrateurs Agri-tech. Les comptes sont créés depuis Supabase Auth.</p></div><LoginForm /></div></main>;
}
