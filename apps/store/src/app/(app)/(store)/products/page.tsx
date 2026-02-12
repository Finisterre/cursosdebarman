import { getProducts } from "@/lib/products";
import { ProductList } from "@/components/store/product-list";

export const revalidate = 0;

export default async function ProductsPage() {
  const products = await getProducts();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Productos</h1>
        <p className="text-sm text-muted-foreground">
          Catálogo completo listo para conectarse con Supabase.
        </p>
      </div>
      <ProductList products={products} />
    </div>
  );
}

