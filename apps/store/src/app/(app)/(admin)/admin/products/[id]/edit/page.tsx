import { notFound } from "next/navigation";
import Link from "next/link";
import { getProductById, getChildProductsWithVariantValues } from "@/lib/products";
import { getCategoriesTree } from "@/lib/categories";
import { getVariantTypes, getVariantValuesByType } from "@/lib/variants";
import { ProductForm } from "@/components/admin/product-form";
import { ProductVariantsEditor } from "@/components/admin/product-variants-editor";
import { ProductVariantsPriceStockEditor } from "@/components/admin/product-variants-price-stock-editor";
import { Button } from "@/components/ui/button";

export const revalidate = 0;

type EditProductPageProps = {
  params: { id: string };
};

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = params;
  const [product, categories, children, variantTypes] = await Promise.all([
    getProductById(id),
    getCategoriesTree(),
    getChildProductsWithVariantValues(id),
    getVariantTypes(),
  ]);

  if (!product) {
    notFound();
  }

  const valuesByType: Record<string, Awaited<ReturnType<typeof getVariantValuesByType>>> = {};
  for (const t of variantTypes) {
    valuesByType[t.id] = await getVariantValuesByType(t.id);
  }

  const isConfigurable = children.length > 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Editar producto</h1>
        <p className="text-sm text-muted-foreground">Actualiza la información del producto.</p>
      </div>
      <ProductForm
        productId={id}
        initialValues={{
          name: product.name,
          price: product.price ?? 0,
          stock: product.stock ?? 0,
          slug: product.slug,
          description: product.description,
          category_id: product.category_id ?? "",
          featured: product.featured ?? false,
        }}
        initialImageUrl={product.image_url}
        categories={categories}
      />

{children.length > 0 && (
        <div className="border-t pt-8">
          <h2 className="text-lg font-semibold mb-4">Precio y stock por variante</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Definí precio y stock para cada variante (SKU). Guardá cada fila después de editar.
          </p>
          <ProductVariantsPriceStockEditor children={children} />
        </div>
      )}

      {!product.is_variant && (
        <div className="border-t pt-8 space-y-4">
          <h2 className="text-lg font-semibold">Variantes</h2>
          <ProductVariantsEditor
            productId={id}
            variantTypes={variantTypes}
            valuesByType={valuesByType}
            isConfigurable={isConfigurable}
          />
        </div>
      )}

    </div>
  );
}

