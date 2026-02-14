import type { Product } from "@/types";
import { ProductCard } from "@/components/store/product-card";

export function ProductList({ products }: { products: Product[] }) {
  return (
    <div className="grid gap-6 md:grid-cols-4 ">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

