import { ProductForm } from "@/components/admin/product-form";
import { getCategoriesTree } from "@/lib/categories";

export const revalidate = 0;

export default async function NewProductPage() {
  const categories = await getCategoriesTree();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Nuevo producto</h1>
        <p className="text-sm text-muted-foreground">
          Formulario base listo para conectar con Supabase.
        </p>
      </div>
      <ProductForm categories={categories} />
    </div>
  );
}

