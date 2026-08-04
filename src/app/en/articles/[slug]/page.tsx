import ArticlePage, {
  generateArticleMetadata,
} from "@/components/public-pages/ArticlePage";
export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}) {
  return generateArticleMetadata(props, "en");
}

export default function EnglishArticlePage(props: {
  params: Promise<{ slug: string }>;
}) {
  return <ArticlePage {...props} locale="en" />;
}
