import AcademyCoursePage, {
  generateAcademyCourseMetadata,
} from "@/components/public-pages/AcademyCoursePage";
export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}) {
  return generateAcademyCourseMetadata(props, "es");
}

export default function SpanishCoursePage(props: {
  params: Promise<{ slug: string }>;
}) {
  return <AcademyCoursePage {...props} locale="es" />;
}
