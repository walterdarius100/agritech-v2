import type { AcademyCourseModule } from "@/types/academy";

const statusLabels: Record<AcademyCourseModule["status"], string> = {
  completed: "Terminé",
  current: "En cours",
  locked: "À suivre",
};

const statusClasses: Record<AcademyCourseModule["status"], string> = {
  completed: "bg-emerald-50 text-emerald-800 ring-emerald-100",
  current: "bg-orange-50 text-orange-700 ring-orange-100",
  locked: "bg-slate-100 text-slate-600 ring-slate-200",
};

export function CourseModuleList({ modules }: { modules: AcademyCourseModule[] }) {
  return (
    <section className="min-w-0 max-w-full overflow-x-hidden rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm sm:p-5">
      <h2 className="break-words text-xl font-bold text-emerald-950">Modules du cours</h2>
      <p className="mt-2 break-words text-sm leading-6 text-slate-600">
        Statuts fictifs pour visualiser le futur parcours d’apprentissage.
      </p>
      <div className="mt-5 space-y-4">
        {modules.map((module, index) => (
          <article
            key={module.title}
            className="min-w-0 max-w-full overflow-x-hidden rounded-2xl border border-slate-100 p-4"
          >
            <div className="flex min-w-0 flex-wrap items-start gap-2">
              <h3 className="min-w-0 flex-1 basis-44 break-words text-sm font-bold leading-relaxed text-emerald-950">
                {String(index + 1).padStart(2, "0")} — {module.title.replace(/^Module \d+\s*:\s*/, "")}
              </h3>
              <span
                className={`inline-flex max-w-full rounded-full px-2.5 py-1 text-[11px] font-bold leading-snug ring-1 ${statusClasses[module.status]}`}
              >
                {statusLabels[module.status]}
              </span>
            </div>
            <ul className="mt-3 min-w-0 list-disc space-y-1 pl-5 text-sm leading-relaxed text-slate-600">
              {module.lessons.map((lesson) => (
                <li key={lesson} className="break-words">
                  {lesson}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
