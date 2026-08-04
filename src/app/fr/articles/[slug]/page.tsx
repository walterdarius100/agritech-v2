import ArticlePage, {
  generateArticleMetadata,
} from "@/components/public-pages/ArticlePage";
export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}) {
  return generateArticleMetadata(props, "fr");
}

export default function FrenchArticlePage(props: {
  params: Promise<{ slug: string }>;
}) {
  return <ArticlePage {...props} locale="fr" />;
}
