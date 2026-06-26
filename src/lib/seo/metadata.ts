import type { Metadata } from "next";

import { siteConfig } from "@/config/site";
import { env } from "@/lib/env";

type SeoInput = {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
};

export function createMetadata({
  title,
  description = siteConfig.description,
  path = "/",
  image,
}: SeoInput = {}): Metadata {
  const canonical = new URL(path, env.siteUrl).toString();

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title: title ? `${title} | ${siteConfig.name}` : siteConfig.name,
      description,
      url: canonical,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      type: "website",
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: title ? `${title} | ${siteConfig.name}` : siteConfig.name,
      description,
      images: image ? [image] : undefined,
    },
  };
}
