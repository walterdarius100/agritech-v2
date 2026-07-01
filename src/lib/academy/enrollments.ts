import { createSupabaseAdminClient } from "@/lib/supabase/server";
import type { AcademyCourse, AcademyEnrollment } from "@/types/academy";

export const ACTIVE_STUDENT_ENROLLMENT_STATUSES = ["active", "completed"] as const;

export type StudentCourseEnrollment = AcademyEnrollment & {
  academy_courses: AcademyCourse;
};

export function enrollmentGrantsAccess(enrollment: Pick<AcademyEnrollment, "status" | "expires_at">) {
  const hasAccessStatus = ACTIVE_STUDENT_ENROLLMENT_STATUSES.includes(
    enrollment.status as (typeof ACTIVE_STUDENT_ENROLLMENT_STATUSES)[number],
  );
  const isNotExpired = !enrollment.expires_at || new Date(enrollment.expires_at) > new Date();
  return hasAccessStatus && isNotExpired;
}

export async function getStudentEnrollments(studentId: string) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return [] as StudentCourseEnrollment[];

  const { data: enrollments, error: enrollmentError } = await supabase
    .from("academy_enrollments")
    .select("*")
    .eq("student_id", studentId)
    .order("created_at", { ascending: false });

  if (enrollmentError || !enrollments?.length) return [] as StudentCourseEnrollment[];

  const typedEnrollments = enrollments as AcademyEnrollment[];
  const courseIds = [...new Set(typedEnrollments.map((enrollment) => enrollment.course_id))];
  const { data: courses, error: courseError } = await supabase.from("academy_courses").select("*").in("id", courseIds);

  if (courseError || !courses?.length) return [] as StudentCourseEnrollment[];

  const coursesById = new Map((courses as AcademyCourse[]).map((course) => [course.id, course]));

  return typedEnrollments
    .map((enrollment) => {
      const course = coursesById.get(enrollment.course_id);
      if (!course) return null;
      return { ...enrollment, academy_courses: course } satisfies StudentCourseEnrollment;
    })
    .filter((enrollment): enrollment is StudentCourseEnrollment => Boolean(enrollment));
}

export async function getActiveStudentEnrollments(studentId: string) {
  const enrollments = await getStudentEnrollments(studentId);
  return enrollments.filter(enrollmentGrantsAccess);
}

export async function getStudentCourseAccess(studentId: string, courseSlug: string) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return { course: null as AcademyCourse | null, enrollment: null as AcademyEnrollment | null, hasAccess: false };

  const { data: course } = await supabase.from("academy_courses").select("*").eq("slug", courseSlug).maybeSingle();
  if (!course) return { course: null, enrollment: null, hasAccess: false };

  const { data: enrollment } = await supabase
    .from("academy_enrollments")
    .select("*")
    .eq("student_id", studentId)
    .eq("course_id", course.id)
    .maybeSingle();

  return {
    course: course as AcademyCourse,
    enrollment: enrollment as AcademyEnrollment | null,
    hasAccess: enrollment ? enrollmentGrantsAccess(enrollment as AcademyEnrollment) : false,
  };
}
