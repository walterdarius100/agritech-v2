import Image from "next/image";

import { Button } from "@/components/ui/Button";
import type { AcademyCourse } from "@/types/academy";

export function CourseCard({ course }: { course: AcademyCourse }) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="relative h-48 overflow-hidden bg-emerald-50">
        <Image
          src={course.image}
          alt={course.imageAlt}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
      </div>
      <div className="p-6">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-600">
          {course.category}
        </p>
        <h3 className="mt-3 text-xl font-bold leading-tight text-emerald-950">
          {course.title}
        </h3>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          {course.shortDescription}
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-slate-600">
          <span className="rounded-full bg-emerald-50 px-3 py-1 font-semibold text-emerald-800">
            {course.modulesCount} modules
          </span>
          <span>{course.progress} % complété</span>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-emerald-50">
          <div
            className="h-full rounded-full bg-emerald-700"
            style={{ width: `${course.progress}%` }}
            aria-hidden="true"
          />
        </div>
        <Button href={`/academy/cours/${course.slug}`} size="sm" className="mt-6">
          Continuer →
        </Button>
      </div>
    </article>
  );
}
