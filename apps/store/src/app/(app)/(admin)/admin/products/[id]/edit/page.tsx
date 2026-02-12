import { notFound } from "next/navigation";
import { getProductById } from "@/lib/products";
import {
  getVariantTypes,
  getAllVariantOptions,
  getProductVariantsForAdmin,
} from "@/lib/variants";
import { getCategoriesTree } from "@/lib/categories";
import { ProductForm } from "@/components/admin/product-form";
import { ProductVariantForm } from "@/components/admin/product-variant-form";

export const revalidate = 0;

type EditProductPageProps = {
  params: { id: string };
};

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = params;
  const [product, categories, variantTypes, variantOptions, variants] = await Promise.all([
    getProductById(id),
    getCategoriesTree(),
    getVariantTypes(),
    getAllVariantOptions(),
    getProductVariantsForAdmin(id),
  ]);

  if (!product) {
    notFound();
  }

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
          price: product.price,
          slug: product.slug,
          description: product.description,
          category_id: product.category_id ?? "",
          featured: product.featured ?? false
        }}
        initialImageUrl={product.image}
        categories={categories}
      />
      <div className="border-t pt-8">
        <ProductVariantForm
          productId={id}
          variantTypes={variantTypes}
          variantOptions={variantOptions}
          initialVariants={variants}
        />
      </div>
    </div>
  );
}

