import ArticlePage, {
  generateArticleMetadata,
} from "@/components/public-pages/ArticlePage";
export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}) {
  return generateArticleMetadata(props, "es");
}

export default function SpanishArticlePage(props: {
  params: Promise<{ slug: string }>;
}) {
  return <ArticlePage {...props} locale="es" />;
}
