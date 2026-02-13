import { NewProductForm } from "@/components/admin/new-product-form";
import { getCategoriesTree } from "@/lib/categories";
import { getVariantTypes, getVariantValuesByType } from "@/lib/variants";

export const revalidate = 0;

export default async function NewProductPage() {
  const [categories, variantTypes] = await Promise.all([
    getCategoriesTree(),
    getVariantTypes(),
  ]);

  const variantValuesByType: Record<string, Awaited<ReturnType<typeof getVariantValuesByType>>> = {};
  for (const t of variantTypes) {
    variantValuesByType[t.id] = await getVariantValuesByType(t.id);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Nuevo producto</h1>
        <p className="text-sm text-muted-foreground">
          Producto simple o configurable con variantes. Si elegís variantes, se generan los hijos (SKU) automáticamente.
        </p>
      </div>
      <NewProductForm
        categories={categories}
        variantTypes={variantTypes}
        variantValuesByType={variantValuesByType}
      />
    </div>
  );
}
