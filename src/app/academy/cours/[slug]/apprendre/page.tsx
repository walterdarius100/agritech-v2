import Link from "next/link";
import { notFound } from "next/navigation";

import { requireStudent } from "@/lib/academy/auth";
import { computeProgress, getLearningPayload } from "@/lib/academy/courses";
import { toggleLessonProgress } from "@/lib/academy/progress";

function getYouTubeEmbedUrl(url?: string | null) {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    const id = parsed.hostname.includes("youtu.be") ? parsed.pathname.slice(1) : parsed.searchParams.get("v");
    return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
  } catch {
    return null;
  }
}

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

  const pct = computeProgress(payload.lessons, payload.progress);
  const done = new Set(payload.progress.filter((p) => p.is_completed).map((p) => p.lesson_id));

  return (
    <main className="bg-[#f8faf7] py-10">
      <div className="mx-auto max-w-7xl px-4">
        <div className="rounded-3xl bg-white p-6 ring-1 ring-emerald-100">
          <p className="text-sm font-bold uppercase text-emerald-700">Espace d’apprentissage</p>
          <h1 className="mt-2 text-4xl font-bold text-emerald-950">{payload.course.title}</h1>
          <div className="mt-5 h-3 rounded-full bg-slate-100"><div className="h-3 rounded-full bg-emerald-700" style={{ width: `${pct}%` }} /></div>
          <p className="mt-2 text-sm text-slate-600">Progression : {pct}% ({payload.progress.filter((p) => p.is_completed).length}/{payload.lessons.length} leçons publiées)</p>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[340px_1fr]">
          <aside className="space-y-4">
            {payload.modules.map((module) => (
              <section key={module.id} className="rounded-2xl bg-white p-4 ring-1 ring-emerald-100">
                <h2 className="font-bold text-emerald-950">{module.position}. {module.title}</h2>
                <div className="mt-3 space-y-2">
                  {payload.lessons.filter((lesson) => lesson.module_id === module.id).map((lesson) => (
                    <form key={lesson.id} action={toggleLessonProgress} className="rounded-xl border p-3">
                      <input type="hidden" name="courseId" value={payload.course.id} />
                      <input type="hidden" name="lessonId" value={lesson.id} />
                      <input type="hidden" name="slug" value={slug} />
                      <input type="hidden" name="completed" value={String(done.has(lesson.id))} />
                      <p className="font-semibold">{done.has(lesson.id) ? "✅" : "○"} {lesson.title}</p>
                      <p className="text-xs text-slate-500">{lesson.duration}</p>
                      <button className="mt-2 text-sm font-semibold text-emerald-700">{done.has(lesson.id) ? "Remettre non terminé" : "Marquer comme terminé"}</button>
                    </form>
                  ))}
                </div>
              </section>
            ))}
            <section className="rounded-2xl bg-white p-4 ring-1 ring-emerald-100">
              <h2 className="font-bold">Ressources du cours</h2>
              {payload.resources.filter((resource) => !resource.lesson_id).map((resource) => (
                <a key={resource.id} className="mt-2 block rounded-xl border p-3 text-sm" href={resource.file_url ?? resource.external_url ?? "#"}>{resource.title} — {resource.resource_type}</a>
              ))}
            </section>
          </aside>

          <section className="rounded-3xl bg-white p-6 ring-1 ring-emerald-100">
            <h2 className="text-2xl font-bold">Contenu des leçons</h2>
            {payload.lessons.length === 0 ? <p className="mt-4 text-slate-600">Aucune leçon publiée pour ce cours.</p> : null}
            {payload.lessons.map((lesson) => {
              const embed = getYouTubeEmbedUrl(lesson.video_url);
              return (
                <article key={lesson.id} className="mt-6 border-t pt-5">
                  <h3 className="text-xl font-bold">{lesson.title}</h3>
                  {embed ? <iframe className="mt-4 aspect-video w-full rounded-2xl" src={embed} title={lesson.title} allowFullScreen /> : null}
                  {!embed && lesson.video_url ? <a className="mt-3 inline-flex rounded-xl bg-emerald-700 px-4 py-2 font-semibold text-white" href={lesson.video_url} target="_blank" rel="noreferrer">Ouvrir la vidéo</a> : null}
                  <p className="mt-4 whitespace-pre-line leading-7 text-slate-700">{lesson.content ?? "Contenu pédagogique à compléter."}</p>
                  <div className="mt-4 space-y-2">
                    {payload.resources.filter((resource) => resource.lesson_id === lesson.id).map((resource) => (
                      <a key={resource.id} className="block rounded-xl border p-3 text-sm" href={resource.file_url ?? resource.external_url ?? "#"}>{resource.title} — {resource.resource_type}</a>
                    ))}
                  </div>
                </article>
              );
            })}
          </section>
        </div>
      </div>
    </main>
  );
}
