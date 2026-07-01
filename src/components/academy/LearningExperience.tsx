"use client";

import { useMemo, useState } from "react";

import { toggleLessonProgress } from "@/lib/academy/progress";
import type { AcademyCourse, AcademyLesson, AcademyModule, AcademyResource, LessonProgress } from "@/types/academy";

type LearningExperienceProps = {
  course: AcademyCourse;
  modules: AcademyModule[];
  lessons: AcademyLesson[];
  resources: AcademyResource[];
  progress: LessonProgress[];
  progressPercent: number;
  slug: string;
};

type TabKey = "about" | "instructor" | "resources";

const tabLabels: Record<TabKey, string> = {
  about: "À propos de ce module",
  instructor: "Formateur de la leçon",
  resources: "Ressources",
};

function getYouTubeEmbedUrl(url?: string | null) {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");
    const id = host === "youtu.be" ? parsed.pathname.slice(1) : parsed.searchParams.get("v");
    return id && (host.includes("youtube.com") || host === "youtu.be") ? `https://www.youtube-nocookie.com/embed/${id}` : null;
  } catch {
    return null;
  }
}

function isMp4Url(url?: string | null) {
  if (!url) return false;
  try {
    return new URL(url).pathname.toLowerCase().endsWith(".mp4");
  } catch {
    return false;
  }
}

function durationToMinutes(duration?: string | null) {
  if (!duration) return 0;
  const match = duration.match(/\d+/);
  return match ? Number(match[0]) : 0;
}

function formatModuleMeta(lessons: AcademyLesson[]) {
  const videos = lessons.filter((lesson) => lesson.video_url).length;
  const minutes = lessons.reduce((total, lesson) => total + durationToMinutes(lesson.duration), 0);
  const lessonLabel = `${lessons.length} leçon${lessons.length > 1 ? "s" : ""}`;
  const videoLabel = `${videos} vidéo${videos > 1 ? "s" : ""}`;
  return minutes ? `${lessonLabel} | ${videoLabel} | Total : ${minutes} min` : `${lessonLabel} | ${videoLabel}`;
}

function ResourceCard({ resource }: { resource: AcademyResource }) {
  const href = resource.external_url ?? resource.file_url ?? "#";
  return (
    <article className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition hover:border-emerald-100">
      <a className="break-words font-bold text-emerald-700 underline-offset-4 hover:text-emerald-800 hover:underline" href={href} target="_blank" rel="noopener noreferrer">
        {resource.title}
      </a>
      <p className="mt-1 text-sm font-semibold text-slate-600">
        {resource.resource_type.toUpperCase()} — {resource.is_downloadable ? "Téléchargeable" : "Consultation"}
      </p>
      {resource.description ? <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-600">{resource.description}</p> : null}
    </article>
  );
}

export function LearningExperience({ course, modules, lessons, resources, progress, progressPercent, slug }: LearningExperienceProps) {
  const firstLesson = lessons[0] ?? null;
  const [activeLessonId, setActiveLessonId] = useState(firstLesson?.id ?? "");
  const [activeTab, setActiveTab] = useState<TabKey>("about");
  const [openModuleIds, setOpenModuleIds] = useState(() => new Set(modules.slice(0, 1).map((module) => module.id)));

  const completedLessonIds = useMemo(() => new Set(progress.filter((item) => item.is_completed).map((item) => item.lesson_id)), [progress]);
  const activeLesson = lessons.find((lesson) => lesson.id === activeLessonId) ?? firstLesson;
  const activeModule = activeLesson ? modules.find((module) => module.id === activeLesson.module_id) ?? null : null;
  const activeResources = resources.filter((resource) => !resource.lesson_id || resource.lesson_id === activeLesson?.id);
  const orphanLessons = lessons.filter((lesson) => !lesson.module_id);
  const embedUrl = getYouTubeEmbedUrl(activeLesson?.video_url);
  const completed = activeLesson ? completedLessonIds.has(activeLesson.id) : false;

  function toggleModule(moduleId: string) {
    setOpenModuleIds((current) => {
      const next = new Set(current);
      if (next.has(moduleId)) next.delete(moduleId);
      else next.add(moduleId);
      return next;
    });
  }

  function selectLesson(lesson: AcademyLesson) {
    setActiveLessonId(lesson.id);
    setActiveTab("about");
    if (lesson.module_id) {
      setOpenModuleIds((current) => new Set(current).add(lesson.module_id ?? ""));
    }
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f8faf7] py-6 sm:py-8">
      <div className="mx-auto max-w-7xl px-4">
        <header className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Agri-tech Academy</p>
              <h1 className="mt-2 break-words text-3xl font-black text-emerald-950 sm:text-4xl">{course.title}</h1>
            </div>
            <p className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-800">Progression : {progressPercent}%</p>
          </div>
          <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100" aria-label={`Progression ${progressPercent}%`}>
            <div className="h-full rounded-full bg-emerald-700 transition-all" style={{ width: `${progressPercent}%` }} />
          </div>
        </header>

        <div className="mt-6 grid min-w-0 gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
          <aside className="min-w-0 lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto lg:pr-1">
            <div className="overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-sm">
              <div className="border-b border-emerald-100 bg-emerald-950 p-5 text-white">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-yellow-300">Programme</p>
                <h2 className="mt-2 text-lg font-bold">Modules et leçons</h2>
                <p className="mt-1 text-sm text-white/70">{lessons.length} leçon{lessons.length > 1 ? "s" : ""} publiée{lessons.length > 1 ? "s" : ""}</p>
              </div>
              <div className="max-h-[70vh] space-y-2 overflow-y-auto overflow-x-hidden p-3 lg:max-h-none">
                {modules.map((module) => {
                  const moduleLessons = lessons.filter((lesson) => lesson.module_id === module.id);
                  const isOpen = openModuleIds.has(module.id);
                  return (
                    <section key={module.id} className="rounded-2xl border border-slate-100 bg-slate-50/70">
                      <button type="button" className="flex w-full min-w-0 items-start gap-3 p-4 text-left" onClick={() => toggleModule(module.id)}>
                        <span className="mt-1 text-emerald-700">{isOpen ? "▾" : "▸"}</span>
                        <span className="min-w-0 flex-1">
                          <span className="block break-words font-bold leading-6 text-emerald-950">{module.position}. {module.title}</span>
                          <span className="mt-1 block text-xs font-medium text-slate-500">{formatModuleMeta(moduleLessons)}</span>
                        </span>
                      </button>
                      {isOpen ? (
                        <div className="space-y-2 px-3 pb-3">
                          {moduleLessons.map((lesson) => {
                            const isActive = activeLesson?.id === lesson.id;
                            const isDone = completedLessonIds.has(lesson.id);
                            return (
                              <button key={lesson.id} type="button" onClick={() => selectLesson(lesson)} className={`w-full rounded-xl border p-3 text-left transition ${isActive ? "border-emerald-500 bg-white shadow-sm ring-2 ring-emerald-100" : "border-transparent bg-white hover:border-emerald-100"}`}>
                                <span className="flex min-w-0 gap-2">
                                  <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs ${isDone ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-500"}`}>{isDone ? "✓" : "▶"}</span>
                                  <span className="min-w-0">
                                    <span className="block break-words text-sm font-semibold text-slate-900">{lesson.title}</span>
                                    <span className="mt-1 block text-xs text-slate-500">{lesson.duration || (lesson.video_url ? "Vidéo" : "Leçon")}</span>
                                  </span>
                                </span>
                              </button>
                            );
                          })}
                          {moduleLessons.length === 0 ? <p className="px-3 pb-2 text-sm text-slate-500">Aucune leçon publiée dans ce module.</p> : null}
                        </div>
                      ) : null}
                    </section>
                  );
                })}

                {orphanLessons.length > 0 ? (
                  <section className="rounded-2xl border border-slate-100 bg-slate-50/70">
                    <div className="p-4">
                      <p className="font-bold text-emerald-950">Leçons complémentaires</p>
                      <p className="mt-1 text-xs font-medium text-slate-500">{formatModuleMeta(orphanLessons)}</p>
                    </div>
                    <div className="space-y-2 px-3 pb-3">
                      {orphanLessons.map((lesson) => {
                        const isActive = activeLesson?.id === lesson.id;
                        const isDone = completedLessonIds.has(lesson.id);
                        return (
                          <button key={lesson.id} type="button" onClick={() => selectLesson(lesson)} className={`w-full rounded-xl border p-3 text-left transition ${isActive ? "border-emerald-500 bg-white shadow-sm ring-2 ring-emerald-100" : "border-transparent bg-white hover:border-emerald-100"}`}>
                            <span className="flex min-w-0 gap-2">
                              <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs ${isDone ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-500"}`}>{isDone ? "✓" : "▶"}</span>
                              <span className="min-w-0">
                                <span className="block break-words text-sm font-semibold text-slate-900">{lesson.title}</span>
                                <span className="mt-1 block text-xs text-slate-500">{lesson.duration || (lesson.video_url ? "Vidéo" : "Leçon")}</span>
                              </span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </section>
                ) : null}
              </div>
            </div>
          </aside>

          <section className="min-w-0 space-y-5">
            <div className="overflow-hidden rounded-3xl border border-emerald-50 bg-white shadow-sm">
              <div className="bg-slate-950 p-1.5 sm:p-2">
                <div className="aspect-video overflow-hidden rounded-2xl bg-black">
                  {embedUrl ? <iframe className="h-full w-full" src={embedUrl} title={activeLesson?.title ?? course.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /> : null}
                  {!embedUrl && isMp4Url(activeLesson?.video_url) ? <video className="h-full w-full" src={activeLesson?.video_url ?? undefined} controls /> : null}
                  {!embedUrl && activeLesson?.video_url && !isMp4Url(activeLesson.video_url) ? (
                    <div className="flex h-full items-center justify-center p-6 text-center text-white">
                      <div>
                        <p className="text-xl font-bold">Vidéo disponible sur une plateforme externe</p>
                        <a className="mt-4 inline-flex rounded-xl bg-yellow-400 px-5 py-3 font-bold text-emerald-950" href={activeLesson.video_url} target="_blank" rel="noreferrer">Ouvrir la vidéo</a>
                      </div>
                    </div>
                  ) : null}
                  {!activeLesson?.video_url ? <div className="flex h-full items-center justify-center p-6 text-center text-white/80">Aucune vidéo n’est encore disponible pour cette leçon.</div> : null}
                </div>
              </div>

              <div className="p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-emerald-700">{activeModule?.title ?? "Leçon"}</p>
                    <h2 className="mt-1 break-words text-2xl font-black text-emerald-950">{activeLesson?.title ?? "Aucune leçon publiée"}</h2>
                  </div>
                  {activeLesson ? (
                    <form action={toggleLessonProgress}>
                      <input type="hidden" name="courseId" value={course.id} />
                      <input type="hidden" name="lessonId" value={activeLesson.id} />
                      <input type="hidden" name="slug" value={slug} />
                      <input type="hidden" name="completed" value={String(completed)} />
                      <button className={`rounded-xl px-5 py-3 text-sm font-bold transition ${completed ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200" : "bg-emerald-700 text-white hover:bg-emerald-800"}`}>
                        {completed ? "✓ Leçon terminée" : "Marquer comme terminé"}
                      </button>
                    </form>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-sm">
              <div className="flex gap-2 overflow-x-auto border-b border-slate-100 px-4 pt-3 sm:px-6">
                {(Object.keys(tabLabels) as TabKey[]).map((tab) => (
                  <button key={tab} type="button" onClick={() => setActiveTab(tab)} className={`whitespace-nowrap border-b-2 px-3 py-3 text-sm font-bold transition ${activeTab === tab ? "border-emerald-700 text-emerald-800" : "border-transparent text-slate-500 hover:text-emerald-700"}`}>
                    {tabLabels[tab]}
                  </button>
                ))}
              </div>
              <div className="p-5 sm:p-6">
                {activeTab === "about" ? (
                  <div className="max-w-3xl">
                    <h3 className="text-xl font-bold text-emerald-950">Objectifs et contenu</h3>
                    <p className="mt-3 whitespace-pre-line leading-7 text-slate-700">
                      {activeModule?.description || activeLesson?.content || "Cette section présente les informations principales de ce module et les objectifs pédagogiques associés."}
                    </p>
                  </div>
                ) : null}
                {activeTab === "instructor" ? (
                  <div className="max-w-3xl rounded-2xl bg-emerald-50 p-5">
                    <p className="text-sm font-bold uppercase tracking-[0.16em] text-emerald-700">Formateur</p>
                    <h3 className="mt-2 text-2xl font-black text-emerald-950">Agri-tech</h3>
                    <p className="mt-3 leading-7 text-slate-700">Cette leçon est préparée par l’équipe Agri-tech dans le cadre de son programme de formation agricole.</p>
                  </div>
                ) : null}
                {activeTab === "resources" ? (
                  <div>
                    <h3 className="text-xl font-bold text-emerald-950">Ressources pédagogiques</h3>
                    <div className="mt-4 grid gap-3">
                      {activeResources.map((resource) => <ResourceCard key={resource.id} resource={resource} />)}
                      {activeResources.length === 0 ? <p className="rounded-2xl bg-slate-50 p-5 text-slate-600">Aucune ressource n’est encore disponible pour cette leçon.</p> : null}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
