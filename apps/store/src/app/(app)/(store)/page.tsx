import Link from "next/link";
import { getFeaturedProducts } from "@/lib/supabase/queries/products";
import { ProductList } from "@/components/store/product-list";
import { Button } from "@/components/ui/button";

export const revalidate = 0;

export default async function StoreHomePage() {
  const featured = await getFeaturedProducts();

  return (
    <div className="space-y-12">
      <section className="rounded-2xl border bg-muted/30 px-8 py-12">
        <div className="max-w-2xl space-y-4">
          <p className="text-sm text-muted-foreground">Colección destacada</p>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Ecommerce moderno listo para escalar.
          </h1>
          <p className="text-muted-foreground">
            Estructura limpia, UI minimalista y base sólida para integrar pagos y logística.
          </p>
          <Button asChild>
            <Link href="/products">Explorar productos</Link>
          </Button>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Destacados</h2>
          <Link href="/products" className="text-sm text-muted-foreground hover:text-foreground">
            Ver todo
          </Link>
        </div>
        <ProductList products={featured} />
      </section>
    </div>
  );
}

