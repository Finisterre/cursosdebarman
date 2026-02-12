import { notFound } from "next/navigation";
import { getFeaturedProducts, getProductBySlug } from "@/lib/products";
import { ProductGallery } from "@/components/store/product-gallery";
import { ProductPurchaseBlock } from "@/components/store/product-purchase-block";
import { Badge } from "@/components/ui/badge";
import { ProductList } from "@/components/store/product-list";
import Link from "next/link";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { getCategoryById } from "@/lib/categories";

export const revalidate = 0;

type ProductDetailPageProps = {
  params: { slug: string };
};

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const product = await getProductBySlug(params.slug);
  const featured = await getFeaturedProducts();
  const category = await getCategoryById(product?.category_id ?? "");

  if (!product) {
    notFound();
  }

  return (
    <>
    <Breadcrumb root={{ label: "Inicio", href: "/" }} firstSegment={{ label: category?.name ?? "", href: `/${category?.slug ?? ""}` }} />
    <div className="grid gap-10 lg:grid-cols-2">
      <ProductGallery image={product.image} name={product.name} />
      <div className="space-y-4">
        <div className="space-y-2">
          {product.featured && <Badge variant="secondary">Destacado</Badge>}
          <h1 className="text-3xl font-semibold">{product.name}</h1>
        </div>
        <p className="text-muted-foreground">{product.description}</p>
        <ProductPurchaseBlock product={product} />
      </div>
    </div>
    <section className="space-y-6 mt-20">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Destacados</h2>
        <Link href="/products" className="text-sm text-muted-foreground hover:text-foreground">
          Ver todo
        </Link>
      </div>    
      <ProductList products={featured} />
     
    </section>
    </>
  );
}

