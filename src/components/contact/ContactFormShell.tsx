import { ContactForm, type ContactFormInitialValues } from "@/components/contact/ContactForm";
import type { Locale } from "@/i18n";

export function ContactFormShell({ serviceSlug, formationSlug, courseSlug, courseTitle, isAcademyAccess, isPartnership, initialValues, locale = "fr" }: { serviceSlug?: string; formationSlug?: string; courseSlug?: string; courseTitle?: string; isAcademyAccess?: boolean; isPartnership?: boolean; initialValues?: ContactFormInitialValues; locale?: Locale }) {
  return <ContactForm courseSlug={courseSlug} courseTitle={courseTitle} formationSlug={formationSlug} initialValues={initialValues} isAcademyAccess={isAcademyAccess} isPartnership={isPartnership} serviceSlug={serviceSlug} locale={locale} />;
}
