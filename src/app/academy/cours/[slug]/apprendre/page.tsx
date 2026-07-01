import Link from "next/link";
import { notFound } from "next/navigation";

import { LearningExperience } from "@/components/academy/LearningExperience";
import { requireStudent } from "@/lib/academy/auth";
import { computeProgress, getLearningPayload } from "@/lib/academy/courses";

export default async function LearnPage({ params }: { params: Promise<{ slug: string }> }) {
  const user = await requireStudent();
  const { slug } = await params;
  const payload = await getLearningPayload(user.id, slug);
  if (!payload) notFound();

  if (!payload.allowed) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-3xl font-bold">Accès non validé</h1>
        <p className="mt-4 text-slate-600">Votre inscription doit être activée par l’administration avant d’ouvrir ce cours.</p>
        <Link className="mt-6 inline-flex rounded-xl bg-emerald-700 px-5 py-3 text-white" href={`/academy/cours/${payload.course.slug}`}>
          Retour au cours
        </Link>
      </main>
    );
  }

  return (
    <LearningExperience
      course={payload.course}
      modules={payload.modules}
      lessons={payload.lessons}
      resources={payload.resources}
      progress={payload.progress}
      progressPercent={computeProgress(payload.lessons, payload.progress)}
      slug={slug}
    />
  );
}
