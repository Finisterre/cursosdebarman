import { notFound } from "next/navigation";
import { getCategoryDescendantsBySlug } from "@/lib/categories";
import { getProductsByCategoryIds } from "@/lib/products";
import { CategoryFilterView } from "@/components/store/category-filter-view";
import { Breadcrumb } from "@/components/ui/breadcrumb";

export const revalidate = 0;

type CategoryPageProps = {
  params: { category: string };
};

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category, ids } = await getCategoryDescendantsBySlug(params.category);

  if (!category || !category.is_active) {
    notFound();
  }

  const products = await getProductsByCategoryIds(ids);

  return (
    <>
    <Breadcrumb />
    <CategoryFilterView category={category} products={products} />
    </>
  );
}

