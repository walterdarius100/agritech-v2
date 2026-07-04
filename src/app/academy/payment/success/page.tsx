import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { getCurrentStudentUser } from "@/lib/academy/auth";
import { getPaymentForStudent } from "@/lib/academy/payments";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export default async function PaymentSuccess({ searchParams }: { searchParams: Promise<{ paymentId?: string }> }) {
  const params = await searchParams;
  const user = await getCurrentStudentUser();
  const payment = user && params.paymentId ? await getPaymentForStudent(params.paymentId, user.id) : null;
  const supabase = createSupabaseAdminClient();
  const { data: course } = payment && supabase ? await supabase.from("academy_courses").select("slug").eq("id", payment.course_id).maybeSingle() : { data: null };
  const paid = payment?.status === "paid";
  const href = paid && course?.slug ? `/academy/cours/${course.slug}/apprendre` : "/academy/mes-cours";
  return <main className="bg-[#f8faf7] py-12"><Container className="max-w-2xl"><div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-emerald-100"><h1 className="text-3xl font-black text-emerald-950">{paid ? "Paiement confirmé" : "Vérification du paiement"}</h1><p className="mt-4 text-slate-700">{paid ? "Paiement confirmé. Votre accès à la formation est activé." : "Le paiement n’est pas encore confirmé. Si vous venez de payer, réessayez dans quelques instants ou contactez Agri-tech."}</p><Link className="mt-6 inline-flex rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white" href={href}>{paid ? "Accéder à ma formation" : "Voir mes cours"}</Link></div></Container></main>;
}
