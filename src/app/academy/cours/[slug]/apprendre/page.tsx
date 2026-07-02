import Link from "next/link";
import { notFound } from "next/navigation";

import { LearningExperience } from "@/components/academy/LearningExperience";
import { requireStudent } from "@/lib/academy/auth";
import { computeProgress, getLearningPayload } from "@/lib/academy/courses";
import { extractCloudflareStreamUid, getVideoEmbed } from "@/lib/academy/video";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

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


  const supabase = createSupabaseAdminClient();
  const { data: profile } = supabase
    ? await supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle()
    : { data: null };
  const metadata = user.user_metadata as { full_name?: string; name?: string } | undefined;
  const videoWatermark = (typeof profile?.full_name === "string" && profile.full_name) || metadata?.full_name || metadata?.name || user.email || "Étudiant Academy";
  const secureLessons = payload.lessons.map((lesson) => {
    const detected = getVideoEmbed(lesson.video_embed_url ?? lesson.video_url);
    const videoUid = lesson.video_uid ?? extractCloudflareStreamUid(lesson.video_embed_url ?? lesson.video_url);
    if (lesson.video_provider === "cloudflare_stream" || videoUid || detected.provider === "cloudflare_stream") {
      return {
        ...lesson,
        video_provider: "cloudflare_stream",
        video_uid: videoUid,
        video_embed_url: null,
        video_url: null,
      };
    }
    return lesson;
  });

  return (
    <LearningExperience
      course={payload.course}
      modules={payload.modules}
      lessons={secureLessons}
      resources={payload.resources}
      progress={payload.progress}
      progressPercent={computeProgress(secureLessons, payload.progress)}
      slug={slug}
      videoWatermark={videoWatermark}
    />
  );
}
