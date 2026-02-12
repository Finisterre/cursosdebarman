import { notFound } from "next/navigation";
import { getProductById } from "@/lib/supabase/queries/products";
import { ProductForm } from "@/components/admin/product-form";

export const revalidate = 0;

type EditProductPageProps = {
  params: { id: string };
};

export default async function EditProductPage({ params }: EditProductPageProps) {
  const product = await getProductById(params.id);

  if (!product) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Editar producto</h1>
        <p className="text-sm text-muted-foreground">Actualiza la información del producto.</p>
      </div>
      <ProductForm
        productId={params.id}
        initialValues={{
          name: product.name,
          price: product.price,
          slug: product.slug,
          description: product.description
        }}
        initialImageUrl={product.image}
      />
    </div>
  );
}

