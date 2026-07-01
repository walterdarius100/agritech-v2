import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  AcademyCourse,
  AcademyEnrollment,
  AcademyLesson,
  AcademyModule,
  AcademyResource,
  LessonProgress,
} from "@/types/academy";

const ACTIVE_ENROLLMENT_STATUSES = ["active", "completed"] as const;

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
  const supabase = createSupabaseServerClient();
  if (!supabase) return { modules: [], lessons: [] };

  const [{ data: modules }, { data: lessons }] = await Promise.all([
    supabase
      .from("academy_modules")
      .select("*")
      .eq("course_id", courseId)
      .eq("status", "published")
      .order("position"),
    supabase
      .from("academy_lessons")
      .select("id,course_id,module_id,title,position,is_preview,duration,status")
      .eq("course_id", courseId)
      .eq("status", "published")
      .order("position"),
  ]);

  return {
    modules: (modules ?? []) as AcademyModule[],
    lessons: (lessons ?? []) as AcademyLesson[],
  };
}

export async function hasActiveEnrollment(studentId: string, courseId: string) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return false;

  const { data } = await supabase
    .from("academy_enrollments")
    .select("id,status,expires_at")
    .eq("student_id", studentId)
    .eq("course_id", courseId)
    .in("status", [...ACTIVE_ENROLLMENT_STATUSES])
    .maybeSingle();

  return Boolean(data && (!data.expires_at || new Date(data.expires_at) > new Date()));
}

export async function getStudentEnrollments(studentId: string) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return [] as AcademyEnrollment[];

  const { data } = await supabase
    .from("academy_enrollments")
    .select("*, academy_courses(*)")
    .eq("student_id", studentId)
    .order("created_at", { ascending: false });

  return (data ?? []) as AcademyEnrollment[];
}

export async function getActiveStudentCourses(studentId: string) {
  const enrollments = await getStudentEnrollments(studentId);
  return enrollments.filter((enrollment) => {
    const isActive = ACTIVE_ENROLLMENT_STATUSES.includes(
      enrollment.status as (typeof ACTIVE_ENROLLMENT_STATUSES)[number],
    );
    const isNotExpired = !enrollment.expires_at || new Date(enrollment.expires_at) > new Date();
    return isActive && isNotExpired && enrollment.academy_courses;
  });
}

export async function getProgressForCourses(studentId: string, courseIds: string[]) {
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
  for (const lesson of (lessons ?? []) as Pick<AcademyLesson, "id" | "course_id">[]) {
    lessonsByCourse.set(lesson.course_id, [...(lessonsByCourse.get(lesson.course_id) ?? []), lesson.id]);
  }

  const completedByCourse = new Map<string, Set<string>>();
  for (const row of (progress ?? []) as Pick<LessonProgress, "course_id" | "lesson_id" | "is_completed">[]) {
    if (!row.is_completed) continue;
    completedByCourse.set(row.course_id, new Set([...(completedByCourse.get(row.course_id) ?? []), row.lesson_id]));
  }

  const result = new Map<string, number>();
  for (const courseId of courseIds) {
    const courseLessons = lessonsByCourse.get(courseId) ?? [];
    const completed = completedByCourse.get(courseId) ?? new Set<string>();
    result.set(courseId, courseLessons.length ? Math.round((completed.size / courseLessons.length) * 100) : 0);
  }

  return result;
}

export async function getLearningPayload(studentId: string, slug: string) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return null;

  const { data: course } = await supabase.from("academy_courses").select("*").eq("slug", slug).maybeSingle();
  if (!course) return null;

  const allowed = await hasActiveEnrollment(studentId, course.id);
  if (!allowed) {
    return {
      course: course as AcademyCourse,
      allowed: false,
      modules: [] as AcademyModule[],
      lessons: [] as AcademyLesson[],
      resources: [] as AcademyResource[],
      progress: [] as LessonProgress[],
    };
  }

  const [{ data: modules }, { data: lessons }, { data: resources }, { data: progress }] = await Promise.all([
    supabase.from("academy_modules").select("*").eq("course_id", course.id).eq("status", "published").order("position"),
    supabase.from("academy_lessons").select("*").eq("course_id", course.id).eq("status", "published").order("position"),
    supabase.from("academy_resources").select("*").eq("course_id", course.id).order("position"),
    supabase.from("academy_lesson_progress").select("*").eq("student_id", studentId).eq("course_id", course.id),
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

export function computeProgress(lessons: { id: string }[], progress: LessonProgress[]) {
  if (!lessons.length) return 0;
  const done = new Set(progress.filter((item) => item.is_completed).map((item) => item.lesson_id));
  return Math.round((lessons.filter((lesson) => done.has(lesson.id)).length / lessons.length) * 100);
}
