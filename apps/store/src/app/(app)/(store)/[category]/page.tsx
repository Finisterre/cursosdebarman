import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategoryDescendantsBySlug, getCategoryBySlug } from "@/lib/categories";
import { getProductsByCategoryIds } from "@/lib/products";
import { getSiteSettings } from "@/lib/site-settings";
import { absoluteUrl } from "@/lib/seo";
import { CategoryFilterView } from "@/components/store/category-filter-view";
import { Breadcrumb } from "@/components/ui/breadcrumb";

export const revalidate = 0;

type CategoryPageProps = {
  params: Promise<{ category: string }>;
};

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category: categorySlug } = await params;
  const [category, settings] = await Promise.all([
    getCategoryBySlug(categorySlug),
    getSiteSettings(),
  ]);
  if (!category || !category.is_active) return { title: "Categoría" };

  const title = category.meta_title?.trim() || category.name || settings?.default_meta_title || settings?.site_name || "Categoría";
  const description =
    category.meta_description?.trim() ||
    category.description?.slice(0, 160) ||
    settings?.default_meta_description?.trim() ||
    undefined;
  const image =
    category.meta_image?.trim() ||
    settings?.default_meta_image?.trim() ||
    undefined;
  const canonical = category.canonical_url?.trim() || absoluteUrl(`/${category.slug}`);
  const noIndex = category.no_index ?? false;

  return {
    title,
    description,
    openGraph: {
      title: category.meta_title?.trim() || category.name,
      description: description ?? undefined,
      url: canonical,
      images: image ? [{ url: image }] : undefined,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: category.meta_title?.trim() || category.name,
      description: description ?? undefined,
      images: image ? [image] : undefined,
    },
    alternates: { canonical },
    robots: { index: !noIndex, follow: true },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category: categorySlug } = await params;
  const { category, ids } = await getCategoryDescendantsBySlug(categorySlug);

  if (!category || !category.is_active) {
    notFound();
  }

  const products = await getProductsByCategoryIds(ids);

  return (
    <>
      <Breadcrumb />
      <article aria-label={`Categoría: ${category.name}`}>
        <CategoryFilterView category={category} products={products} />
      </article>
    </>
  );
}

