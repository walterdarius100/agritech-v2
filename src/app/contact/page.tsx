import type { Metadata } from "next";

import { ContactFormShell } from "@/components/contact/ContactFormShell";
import { getCurrentStudentUser } from "@/lib/academy/auth";
import { getAcademyCourseBySlug } from "@/lib/academy/courses";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createMetadata({
  title: "Contacter Agri-tech",
  description:
    "Contactez Agri-tech pour présenter un besoin de service agricole, une demande de formation ou une idée de partenariat.",
  path: "/contact",
});

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string; formation?: string; type?: string; course?: string }>;
}) {
  const params = await searchParams;
  const isAcademyAccess = params.type === "academy-access";
  const courseSlug = isAcademyAccess ? params.course ?? "" : "";
  const [course, user] = await Promise.all([courseSlug ? getAcademyCourseBySlug(courseSlug) : null, getCurrentStudentUser()]);
  let profileName = "";
  if (user) {
    const supabase = createSupabaseAdminClient();
    const { data: profile } = supabase
      ? await supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle()
      : { data: null };
    profileName = typeof profile?.full_name === "string" ? profile.full_name : "";
  }
  const metadata = user?.user_metadata as { full_name?: string; name?: string } | undefined;
  const initialValues = {
    fullName: profileName || metadata?.full_name || metadata?.name || "",
    email: user?.email ?? "",
  };

  return (
    <>
      <section className="bg-emerald-950 py-14 text-white sm:py-18">
        <Container>
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-yellow-400">Contact</p>
            <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl">Parlons de votre projet agricole.</h1>
            <p className="mt-6 text-lg leading-8 text-emerald-50">
              Expliquez-nous votre besoin, votre idée ou votre situation actuelle. L’équipe Agri-tech vous répondra avec une orientation claire pour avancer de manière structurée.
            </p>
          </div>
        </Container>
      </section>
      <Section>
        <div className="mx-auto max-w-4xl">
          <ContactFormShell courseSlug={courseSlug} courseTitle={course?.title} formationSlug={params.formation} initialValues={initialValues} isAcademyAccess={isAcademyAccess} serviceSlug={params.service} />
        </div>
      </Section>
    </>
  );
}
