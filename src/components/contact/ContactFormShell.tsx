import { ContactForm, type ContactFormInitialValues } from "@/components/contact/ContactForm";

export function ContactFormShell({ serviceSlug, formationSlug, courseSlug, courseTitle, isAcademyAccess, isPartnership, initialValues }: { serviceSlug?: string; formationSlug?: string; courseSlug?: string; courseTitle?: string; isAcademyAccess?: boolean; isPartnership?: boolean; initialValues?: ContactFormInitialValues }) {
  return <ContactForm courseSlug={courseSlug} courseTitle={courseTitle} formationSlug={formationSlug} initialValues={initialValues} isAcademyAccess={isAcademyAccess} isPartnership={isPartnership} serviceSlug={serviceSlug} />;
}
