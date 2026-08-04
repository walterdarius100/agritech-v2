import AcademyCoursePage from "@/components/public-pages/AcademyCoursePage";
export default function EnglishCoursePage(props: {
  params: Promise<{ slug: string }>;
}) {
  return <AcademyCoursePage {...props} locale="en" />;
}
