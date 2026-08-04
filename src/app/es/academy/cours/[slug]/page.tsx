import AcademyCoursePage from "@/components/public-pages/AcademyCoursePage";
export default function SpanishCoursePage(props: {
  params: Promise<{ slug: string }>;
}) {
  return <AcademyCoursePage {...props} locale="es" />;
}
