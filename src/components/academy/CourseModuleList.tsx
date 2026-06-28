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
    <section className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-xl font-bold text-emerald-950">Modules du cours</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Statuts fictifs pour visualiser le futur parcours d’apprentissage.
      </p>
      <div className="mt-5 space-y-4">
        {modules.map((module, index) => (
          <article key={module.title} className="rounded-2xl border border-slate-100 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <h3 className="font-bold leading-6 text-emerald-950">
                {String(index + 1).padStart(2, "0")} — {module.title.replace(/^Module \d+\s*:\s*/, "")}
              </h3>
              <span className={`w-fit rounded-full px-3 py-1 text-xs font-bold ring-1 ${statusClasses[module.status]}`}>
                {statusLabels[module.status]}
              </span>
            </div>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-6 text-slate-600">
              {module.lessons.map((lesson) => (
                <li key={lesson}>{lesson}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
