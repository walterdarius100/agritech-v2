import {
  enrollmentGrantsAccess,
  getActiveStudentEnrollments,
  getStudentCourseAccess,
  getStudentEnrollments as getStudentEnrollmentsForAccess,
} from "@/lib/academy/enrollments";
import {
  createSupabaseAdminClient,
  createSupabaseServerClient,
} from "@/lib/supabase/server";
import type {
  AcademyCourse,
  AcademyLesson,
  AcademyModule,
  AcademyResource,
  LessonProgress,
} from "@/types/academy";
import type { Locale } from "@/i18n";
import { getLocalizedField } from "@/lib/i18n/localized-content";

export function getLocalizedCourse(
  course: AcademyCourse,
  locale: Locale,
): AcademyCourse {
  const localized = (field: string, fallback: unknown) =>
    getLocalizedField({
      locale,
      field,
      translations: course.translations,
      fallback,
    });
  const localizedOptional = (field: string, fallback: unknown) =>
    localized(field, fallback) || null;

  return {
    ...course,
    title: localized("title", course.title),
    category: localized("category", course.category),
    short_description: localizedOptional(
      "short_description",
      course.short_description,
    ),
    description: localizedOptional("description", course.description),
    objectives: localizedOptional("objectives", course.objectives),
    target_audience: localizedOptional(
      "target_audience",
      course.target_audience,
    ),
    program_summary: localizedOptional(
      "program_summary",
      course.program_summary,
    ),
    duration: localizedOptional("duration", course.duration),
    certification_description: localizedOptional(
      "certification_description",
      course.certification_description,
    ),
    instructor_role: localizedOptional(
      "instructor_role",
      course.instructor_role,
    ),
    instructor_bio: localizedOptional("instructor_bio", course.instructor_bio),
  };
}

export function getLocalizedPublicProgram(
  program: Awaited<ReturnType<typeof getPublicCourseProgram>>,
  locale: Locale,
) {
  return {
    ...program,
    modules: program.modules.map((module) => ({
      ...module,
      title: getLocalizedField({
        locale,
        field: "title",
        translations: module.translations,
        fallback: module.title,
      }),
      description: getLocalizedField({
        locale,
        field: "description",
        translations: module.translations,
        fallback: module.description,
      }),
    })),
    lessons: program.lessons.map((lesson) => ({
      ...lesson,
      title: getLocalizedField({
        locale,
        field: "title",
        translations: lesson.translations,
        fallback: lesson.title,
      }),
    })),
  };
}

export async function getPublishedAcademyCourses() {
  const supabase = createSupabaseServerClient();
  if (!supabase) return [] as AcademyCourse[];

  const { data } = await supabase
    .from("academy_courses")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  return (data ?? []) as AcademyCourse[];
}

export async function getAcademyCourseBySlug(slug: string) {
  const supabase = createSupabaseServerClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from("academy_courses")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  return data as AcademyCourse | null;
}

export async function getPublicCourseProgram(courseId: string) {
  const supabase = createSupabaseAdminClient() ?? createSupabaseServerClient();
  if (!supabase) return { modules: [], lessons: [], resources: [] };

  const [{ data: modules }, { data: lessons }, { data: resources }] =
    await Promise.all([
      supabase
        .from("academy_modules")
        .select("*")
        .eq("course_id", courseId)
        .eq("status", "published")
        .order("position"),
      supabase
        .from("academy_lessons")
        .select(
          "id,course_id,module_id,title,position,is_preview,duration,status,translations",
        )
        .eq("course_id", courseId)
        .eq("status", "published")
        .order("position"),
      supabase
        .from("academy_resources")
        .select(
          "id,course_id,lesson_id,title,description,file_url,external_url,resource_type,is_downloadable,position",
        )
        .eq("course_id", courseId)
        .order("position"),
    ]);

  return {
    modules: (modules ?? []) as AcademyModule[],
    lessons: (lessons ?? []) as AcademyLesson[],
    resources: (resources ?? []) as AcademyResource[],
  };
}

export async function hasActiveEnrollment(studentId: string, courseId: string) {
  const enrollments = await getStudentEnrollmentsForAccess(studentId);
  return enrollments.some(
    (enrollment) =>
      enrollment.course_id === courseId && enrollmentGrantsAccess(enrollment),
  );
}

export async function getStudentEnrollments(studentId: string) {
  return getStudentEnrollmentsForAccess(studentId);
}

export async function getActiveStudentCourses(studentId: string) {
  return getActiveStudentEnrollments(studentId);
}

export async function getProgressForCourses(
  studentId: string,
  courseIds: string[],
) {
  const supabase = createSupabaseAdminClient();
  if (!supabase || courseIds.length === 0) return new Map<string, number>();

  const [{ data: lessons }, { data: progress }] = await Promise.all([
    supabase
      .from("academy_lessons")
      .select("id,course_id")
      .in("course_id", courseIds)
      .eq("status", "published"),
    supabase
      .from("academy_lesson_progress")
      .select("course_id,lesson_id,is_completed")
      .eq("student_id", studentId)
      .in("course_id", courseIds),
  ]);

  const lessonsByCourse = new Map<string, string[]>();
  for (const lesson of (lessons ?? []) as Pick<
    AcademyLesson,
    "id" | "course_id"
  >[]) {
    lessonsByCourse.set(lesson.course_id, [
      ...(lessonsByCourse.get(lesson.course_id) ?? []),
      lesson.id,
    ]);
  }

  const completedByCourse = new Map<string, Set<string>>();
  for (const row of (progress ?? []) as Pick<
    LessonProgress,
    "course_id" | "lesson_id" | "is_completed"
  >[]) {
    if (!row.is_completed) continue;
    completedByCourse.set(
      row.course_id,
      new Set([...(completedByCourse.get(row.course_id) ?? []), row.lesson_id]),
    );
  }

  const result = new Map<string, number>();
  for (const courseId of courseIds) {
    const courseLessons = lessonsByCourse.get(courseId) ?? [];
    const completed = completedByCourse.get(courseId) ?? new Set<string>();
    result.set(
      courseId,
      courseLessons.length
        ? Math.round((completed.size / courseLessons.length) * 100)
        : 0,
    );
  }

  return result;
}

export async function getLearningPayload(studentId: string, slug: string) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return null;

  const access = await getStudentCourseAccess(studentId, slug);
  if (!access.course) return null;

  if (!access.hasAccess) {
    return {
      course: access.course,
      allowed: false,
      modules: [] as AcademyModule[],
      lessons: [] as AcademyLesson[],
      resources: [] as AcademyResource[],
      progress: [] as LessonProgress[],
    };
  }

  const course = access.course;

  const [
    { data: modules },
    { data: lessons },
    { data: resources },
    { data: progress },
  ] = await Promise.all([
    supabase
      .from("academy_modules")
      .select("*")
      .eq("course_id", course.id)
      .eq("status", "published")
      .order("position"),
    supabase
      .from("academy_lessons")
      .select("*")
      .eq("course_id", course.id)
      .eq("status", "published")
      .order("position"),
    supabase
      .from("academy_resources")
      .select("*")
      .eq("course_id", course.id)
      .order("position"),
    supabase
      .from("academy_lesson_progress")
      .select("*")
      .eq("student_id", studentId)
      .eq("course_id", course.id),
  ]);

  return {
    course: course as AcademyCourse,
    allowed: true,
    modules: (modules ?? []) as AcademyModule[],
    lessons: (lessons ?? []) as AcademyLesson[],
    resources: (resources ?? []) as AcademyResource[],
    progress: (progress ?? []) as LessonProgress[],
  };
}

export function computeProgress(
  lessons: { id: string }[],
  progress: LessonProgress[],
) {
  if (!lessons.length) return 0;
  const done = new Set(
    progress.filter((item) => item.is_completed).map((item) => item.lesson_id),
  );
  return Math.round(
    (lessons.filter((lesson) => done.has(lesson.id)).length / lessons.length) *
      100,
  );
}
