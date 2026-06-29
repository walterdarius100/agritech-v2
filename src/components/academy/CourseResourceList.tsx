import type { AcademyCourseResource } from "@/types/academy";

export function CourseResourceList({
  resources,
  compact = false,
}: {
  resources: AcademyCourseResource[];
  compact?: boolean;
}) {
  return (
    <section className="min-w-0 max-w-full overflow-x-hidden rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm sm:p-5">
      <h2 className="break-words text-xl font-bold text-emerald-950">Ressources pédagogiques</h2>
      <p className="mt-2 break-words text-sm leading-6 text-slate-600">
        Aucun téléchargement réel n’est activé dans ce prototype.
      </p>
      <div className={compact ? "mt-5 grid min-w-0 gap-3" : "mt-5 min-w-0 space-y-3"}>
        {resources.map((resource) => (
          <div
            key={`${resource.title}-${resource.type}`}
            className="flex min-w-0 max-w-full flex-wrap items-start justify-between gap-3 rounded-2xl border border-slate-100 p-4"
          >
            <div className="min-w-0 flex-1 basis-36">
              <p className="break-words font-semibold leading-relaxed text-emerald-950">{resource.title}</p>
              <p className="mt-1 break-words text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                {resource.type}
              </p>
            </div>
            <span className="inline-flex max-w-full rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold leading-snug text-slate-600">
              Bientôt disponible
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
