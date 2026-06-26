import type { Metadata } from "next";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { articles } from "@/data/articles";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createMetadata({ title: "Actualités agricoles", path: "/actualites" });

export default function ActualitesPage() {
  return (
    <Section>
      <SectionHeader title="Actualités agricoles" description="Articles temporaires pour préparer le futur blog Agri-tech connecté à Supabase." />
      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {articles.map((article) => (
          <Card key={article.slug}>
            <Badge tone="orange">{article.category}</Badge>
            <p className="mt-4 text-sm text-slate-500">{article.published_at}</p>
            <h2 className="mt-2 text-xl font-bold text-emerald-950">{article.title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">{article.excerpt}</p>
            <Button href={`/articles/${article.slug}`} variant="ghost" className="mt-5 px-0">Lire l’article</Button>
          </Card>
        ))}
      </div>
    </Section>
  );
}
