import { getProducts } from "@/lib/products";
import { ProductList } from "@/components/store/product-list";
import { ProductSearch } from "@/components/store/product-search";
import { Suspense } from "react";

export const revalidate = 0;

type Props = {
  searchParams: { q?: string };
};

export default async function ProductsPage({ searchParams }: Props) {
  const q = searchParams?.q;
  const products = await getProducts({ search: q });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Productos</h1>
         
        </div>
        {/* <Suspense fallback={<div className="h-10 w-full max-w-md animate-pulse rounded-md bg-muted" />}>
          <ProductSearch defaultValue={q} />
        </Suspense> */}
      </div>
      {products.length === 0 ? (
        <p className="text-muted-foreground">
          {q ? `No se encontraron productos con "${q}".` : "No hay productos en el catálogo."}
        </p>
      ) : (
        <ProductList products={products} />
      )}
    </div>
  );
}

