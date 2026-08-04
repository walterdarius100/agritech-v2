import ArticlePage from "@/components/public-pages/ArticlePage";
export default function EnglishArticlePage(props: {
  params: Promise<{ slug: string }>;
}) {
  return <ArticlePage {...props} locale="en" />;
}
