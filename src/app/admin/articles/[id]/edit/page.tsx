import { notFound } from "next/navigation";
import Link from "next/link";
import { ArticleForm } from "@/components/admin/ArticleForm";
import {
  getAdminArticleById,
  getArticleFormDefaults,
  updateArticle,
} from "@/lib/articles/adminArticles";

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const article = await getAdminArticleById(id);
  if (!article) notFound();
  const action = updateArticle.bind(null, id);
  return (
    <div>
      <Link
        className="text-sm font-semibold text-emerald-800"
        href="/admin/articles"
      >
        ← Articles
      </Link>
      <h1 className="mt-4 text-3xl font-bold">Modifier l’article</h1>
      <p className="mt-2 text-slate-600">{article.title}</p>
      <div className="mt-6">
        <ArticleForm
          action={action}
          defaults={getArticleFormDefaults(article)}
          submitLabel="Mettre à jour"
          mode="edit"
        />
      </div>
    </div>
  );
}
