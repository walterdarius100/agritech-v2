import { Button } from "@/components/ui/Button";
import { CourseModuleList } from "@/components/academy/CourseModuleList";
import { CourseResourceList } from "@/components/academy/CourseResourceList";
import type { AcademyCourse } from "@/types/academy";

export function CoursePlayerLayout({ course }: { course: AcademyCourse }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
      <div className="space-y-6">
        <section className="overflow-hidden rounded-2xl border border-emerald-900/10 bg-emerald-950 shadow-sm">
          <div className="flex min-h-72 items-center justify-center bg-[radial-gradient(circle_at_24%_24%,rgba(250,204,21,0.16),transparent_26%),radial-gradient(circle_at_80%_20%,rgba(34,197,94,0.18),transparent_28%)] p-8 text-center text-white">
            <div className="max-w-md">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/12 ring-1 ring-white/25" aria-hidden="true">
                <span className="ml-1 block h-0 w-0 border-y-[12px] border-l-[18px] border-y-transparent border-l-white" />
              </div>
              <h2 className="mt-6 text-2xl font-bold">Aperçu du cours</h2>
              <p className="mt-3 leading-7 text-white/75">
                Le lecteur vidéo et les contenus interactifs seront activés dans une prochaine étape.
              </p>
            </div>
          </div>
        </section>

        <CourseResourceList resources={course.resources} compact />
      </div>

      <aside className="space-y-6">
        <CourseModuleList modules={course.modules} />
        <section className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-bold text-emerald-950">Progression fictive</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {course.currentLesson ? `Leçon en cours : ${course.currentLesson}.` : "Parcours en préparation."}
          </p>
          <div className="mt-5 flex items-end justify-between gap-4">
            <span className="text-4xl font-black text-emerald-950">{course.progress} %</span>
            <Button href={`/formations/${course.slug}`} variant="outline" size="sm">
              Voir la page publique
            </Button>
          </div>
          <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-emerald-50">
            <div className="h-full rounded-full bg-emerald-700" style={{ width: `${course.progress}%` }} aria-hidden="true" />
          </div>
        </section>
      </aside>
    </div>
  );
}
