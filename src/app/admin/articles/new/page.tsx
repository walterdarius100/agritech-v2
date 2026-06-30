import Link from "next/link";
import { ArticleForm } from "@/components/admin/ArticleForm";
import { requireAuthorizedAdmin } from "@/lib/auth/adminAuth";
import {
  createArticle,
  getArticleFormDefaults,
} from "@/lib/articles/adminArticles";

export default async function NewArticlePage() {
  await requireAuthorizedAdmin();
  return (
    <div>
      <Link
        className="text-sm font-semibold text-emerald-800"
        href="/admin/articles"
      >
        ← Articles
      </Link>
      <h1 className="mt-4 text-3xl font-bold">Nouvel article</h1>
      <div className="mt-6">
        <ArticleForm
          action={createArticle}
          defaults={getArticleFormDefaults()}
          submitLabel="Créer l’article"
          mode="create"
        />
      </div>
    </div>
  );
}
