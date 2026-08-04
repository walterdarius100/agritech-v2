import AcademyCoursePage from "@/components/public-pages/AcademyCoursePage";
export default function FrenchCoursePage(props: {
  params: Promise<{ slug: string }>;
}) {
  return <AcademyCoursePage {...props} locale="fr" />;
}
