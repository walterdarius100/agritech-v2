import type { AcademyCourseResource } from "@/types/academy";

export function CourseResourceList({
  resources,
  compact = false,
}: {
  resources: AcademyCourseResource[];
  compact?: boolean;
}) {
  return (
    <section className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-xl font-bold text-emerald-950">Ressources pédagogiques</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Aucun téléchargement réel n’est activé dans ce prototype.
      </p>
      <div className={compact ? "mt-5 grid gap-3 sm:grid-cols-2" : "mt-5 space-y-3"}>
        {resources.map((resource) => (
          <div
            key={`${resource.title}-${resource.type}`}
            className="flex items-center justify-between gap-4 rounded-2xl border border-slate-100 p-4"
          >
            <div>
              <p className="font-semibold text-emerald-950">{resource.title}</p>
              <p className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                {resource.type}
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              Bientôt disponible
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
