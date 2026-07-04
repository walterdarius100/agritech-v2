export type AcademyStatus = "draft" | "published" | "archived";
export type AcademyLevel = "beginner" | "intermediate" | "advanced";
export type EnrollmentStatus = "pending" | "active" | "rejected" | "expired" | "completed";
export type EnrollmentSource = "manual" | "payment" | "free" | "admin_grant";
export type CertificateStatus = "valid" | "revoked" | "draft";

export type AcademyCourse = {
  id: string; title: string; slug: string; category: string; short_description: string | null; description: string | null; cover_image_url: string | null; level: AcademyLevel | null; duration: string | null; language: string | null; status: AcademyStatus; price_amount: number | null; price_currency: string | null; is_free: boolean; published_at: string | null; certification_description: string | null; instructor_name: string | null; instructor_role: string | null; instructor_bio: string | null; instructor_image_url: string | null; created_at: string; updated_at: string;
};
export type AcademyModule = { id: string; course_id: string; title: string; description: string | null; position: number; status: AcademyStatus; };
export type AcademyLesson = { id: string; course_id: string; module_id: string | null; title: string; content: string | null; video_url: string | null; video_provider: string | null; video_uid: string | null; video_embed_url: string | null; position: number; is_preview: boolean; duration: string | null; status: AcademyStatus; };
export type AcademyResource = { id: string; course_id: string; lesson_id: string | null; title: string; description: string | null; file_url: string | null; external_url: string | null; resource_type: "document" | "pdf" | "video" | "link" | "image" | "other"; is_downloadable: boolean; position: number; };
export type AcademyEnrollment = { id: string; student_id: string; course_id: string; status: EnrollmentStatus; access_source: EnrollmentSource; payment_reference: string | null; amount_paid: number | null; currency: string | null; validated_by: string | null; validated_at: string | null; expires_at: string | null; created_at: string; updated_at: string; academy_courses?: AcademyCourse | null; profiles?: Profile | null; };
export type LessonProgress = { id: string; student_id: string; course_id: string; lesson_id: string; is_completed: boolean; completed_at: string | null; last_position_seconds: number | null; };
export type AcademyCertificate = { id: string; certificate_id: string; student_id: string; course_id: string; enrollment_id: string | null; student_full_name: string; course_title: string; issued_at: string; status: CertificateStatus; verification_url: string | null; pdf_url: string | null; qr_code_url: string | null; metadata?: Record<string, unknown>; created_at: string; updated_at: string; academy_courses?: AcademyCourse | null; profiles?: Profile | null; };
export type Profile = { id: string; full_name: string | null; phone: string | null; organization: string | null; role: "student" | "admin"; created_at: string; updated_at: string; };

export type AcademyModuleStatus = "completed" | "current" | "locked";
export type AcademyResourceType = "PDF" | "Fiche" | "Checklist" | "Guide";
export type AcademyResourceStatus = "available" | "coming-soon";
export type AcademyCourseModule = { title: string; lessons: string[]; status: AcademyModuleStatus; };
export type AcademyCourseResource = { title: string; type: AcademyResourceType; status: AcademyResourceStatus; };
export type AcademyPrototypeCourse = { title: string; slug: string; category: string; shortDescription: string; image: string; imageAlt: string; progress: number; modulesCount: number; currentLesson?: string; modules: AcademyCourseModule[]; resources: AcademyCourseResource[]; };
