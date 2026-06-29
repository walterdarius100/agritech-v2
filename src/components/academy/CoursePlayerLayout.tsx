import { Button } from "@/components/ui/Button";
import { CourseModuleList } from "@/components/academy/CourseModuleList";
import { CourseResourceList } from "@/components/academy/CourseResourceList";
import type { AcademyCourse } from "@/types/academy";

export function CoursePlayerLayout({ course }: { course: AcademyCourse }) {
  return (
    <div className="grid max-w-full gap-6 overflow-x-hidden lg:grid-cols-[340px_minmax(0,1fr)] xl:grid-cols-[360px_minmax(0,1fr)]">
      <aside className="order-2 lg:sticky lg:top-24 lg:order-1 lg:h-[calc(100vh-6rem)] lg:overflow-x-hidden lg:overflow-y-auto lg:pr-2">
        <div className="min-w-0 max-w-full space-y-5 overflow-x-hidden rounded-2xl border border-emerald-100 bg-white/75 p-4 shadow-sm lg:bg-white">
          <div className="min-w-0 rounded-2xl bg-emerald-950 p-5 text-white">
            <Button
              href="/academy"
              variant="ghost"
              size="sm"
              className="px-0 text-white/80 hover:bg-transparent hover:text-white"
            >
              ← Retour à l’espace étudiant
            </Button>
            <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-yellow-300">
              {course.category}
            </p>
            <h2 className="mt-2 break-words text-lg font-bold leading-6">{course.title}</h2>
          </div>

          <CourseModuleList modules={course.modules} />
          <CourseResourceList resources={course.resources} compact />

          <div className="sticky bottom-0 -mx-4 -mb-4 rounded-b-2xl bg-gradient-to-t from-white via-white/95 to-white/0 px-4 pb-4 pt-8 text-center hidden lg:block">
            <span className="inline-flex items-center rounded-full border border-emerald-100 bg-white px-3 py-1 text-xs font-semibold text-emerald-800 shadow-sm">
              Faire défiler ↓
            </span>
          </div>
        </div>
      </aside>

      <div className="order-1 min-w-0 max-w-full space-y-6 overflow-x-hidden lg:order-2">
        <section className="overflow-hidden rounded-2xl border border-emerald-900/10 bg-emerald-950 shadow-sm">
          <div className="flex min-h-[320px] items-center justify-center bg-[radial-gradient(circle_at_24%_24%,rgba(250,204,21,0.16),transparent_26%),radial-gradient(circle_at_80%_20%,rgba(34,197,94,0.18),transparent_28%)] p-8 text-center text-white sm:min-h-[380px] lg:min-h-[460px] xl:min-h-[520px]">
            <div className="max-w-lg">
              <div
                className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/12 ring-1 ring-white/25"
                aria-hidden="true"
              >
                <span className="ml-1 block h-0 w-0 border-y-[14px] border-l-[22px] border-y-transparent border-l-white" />
              </div>
              <h2 className="mt-7 text-3xl font-bold">Aperçu du cours</h2>
              <p className="mt-3 text-base leading-7 text-white/75">
                Le lecteur vidéo et les contenus interactifs seront activés dans une prochaine étape.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <h2 className="text-xl font-bold text-emerald-950">Progression fictive</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {course.currentLesson
                  ? `Leçon en cours : ${course.currentLesson}.`
                  : "Parcours en préparation."}
              </p>
            </div>
            <Button href={`/formations/${course.slug}`} variant="outline" size="sm">
              Voir la page publique
            </Button>
          </div>
          <div className="mt-5 flex items-end gap-4">
            <span className="text-4xl font-black text-emerald-950">{course.progress} %</span>
            <div className="mb-2 h-2.5 flex-1 overflow-hidden rounded-full bg-emerald-50">
              <div
                className="h-full rounded-full bg-emerald-700"
                style={{ width: `${course.progress}%` }}
                aria-hidden="true"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
