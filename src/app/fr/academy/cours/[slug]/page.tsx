import AcademyCoursePage, {
  generateAcademyCourseMetadata,
} from "@/components/public-pages/AcademyCoursePage";
export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}) {
  return generateAcademyCourseMetadata(props, "fr");
}

export default function FrenchCoursePage(props: {
  params: Promise<{ slug: string }>;
}) {
  return <AcademyCoursePage {...props} locale="fr" />;
}
