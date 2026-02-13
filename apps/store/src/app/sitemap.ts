import { getBaseUrl } from "@/lib/seo";
import { getCategoriesForSitemap } from "@/lib/categories";
import { getProductsForSitemap } from "@/lib/products";
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl();
  const [categories, products] = await Promise.all([
    getCategoriesForSitemap(),
    getProductsForSitemap(),
  ]);

  const entries: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  for (const cat of categories) {
    entries.push({
      url: `${baseUrl}/${cat.slug}`,
      lastModified: cat.updated_at ? new Date(cat.updated_at) : new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    });
  }

  for (const prod of products) {
    entries.push({
      url: `${baseUrl}/products/${prod.slug}`,
      lastModified: prod.updated_at ? new Date(prod.updated_at) : new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    });
  }

  return entries;
}
