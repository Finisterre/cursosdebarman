import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/products";
import { ProductGallery } from "@/components/store/product-gallery";
import { AddToCartButton } from "@/components/store/add-to-cart-button";
import { Badge } from "@/components/ui/badge";

export const revalidate = 0;

type ProductDetailPageProps = {
  params: { slug: string };
};

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const product = await getProductBySlug(params.slug);

  if (!product) {
    notFound();
  }

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <ProductGallery image={product.image} name={product.name} />
      <div className="space-y-4">
        <div className="space-y-2">
          {product.featured && <Badge variant="secondary">Destacado</Badge>}
          <h1 className="text-3xl font-semibold">{product.name}</h1>
          <p className="text-lg font-medium">${product.price.toLocaleString("es-AR")}</p>
        </div>
        <p className="text-muted-foreground">{product.description}</p>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Variantes disponibles</p>
          <div className="flex flex-wrap gap-2">
            {(product.variants ?? [
              { id: product.id, productId: product.id, name: "Única", price: product.price, stock: 0 }
            ]).map((variant) => (
              <Badge key={variant.id} variant="outline">
                {variant.name}
              </Badge>
            ))}
          </div>
        </div>
        <AddToCartButton product={product} />
      </div>
    </div>
  );
}

