import type { Product } from "@/types";
import { absoluteUrl } from "@/lib/seo";

type ProductJsonLdProps = {
  product: Product;
};

export function ProductJsonLd({ product }: ProductJsonLdProps) {
  const sellingPrice = product.sale_price != null && product.sale_price > 0 ? product.sale_price : (product.price ?? 0);
  const availability =
    product.stock != null
      ? product.stock > 0
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock"
      : "https://schema.org/InStock";

  const hasSale = product.sale_price != null && product.sale_price > 0 && (product.price ?? 0) > product.sale_price;

  const schema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.name,
    description: product.description?.slice(0, 500) ?? product.name,
    image: product.meta_image || product.image_url || undefined,
    sku: product.sku || product.id,
    offers: {
      "@type": "Offer",
      priceCurrency: "ARS",
      price: String(sellingPrice),
      availability,
      url: absoluteUrl(`/products/${product.slug}`),
      ...(hasSale && {
        priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      }),
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
