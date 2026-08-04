import AcademyCoursePage, {
  generateAcademyCourseMetadata,
} from "@/components/public-pages/AcademyCoursePage";
export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}) {
  return generateAcademyCourseMetadata(props, "en");
}

export default function EnglishCoursePage(props: {
  params: Promise<{ slug: string }>;
}) {
  return <AcademyCoursePage {...props} locale="en" />;
}
