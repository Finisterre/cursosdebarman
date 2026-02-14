import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/types";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e";

function getMinVariantPrice(variants: Product[] | undefined): number | null {
  if (!variants?.length) return null;
  const prices = variants
    .map((v) => v.price)
    .filter((p): p is number => p != null && p > 0);
  return prices.length ? Math.min(...prices) : null;
}

export function ProductCard({ product }: { product: Product }) {
  const imageUrl = product.image_url ?? FALLBACK_IMAGE;
  const hasDirectPrice = product.price != null && product.price > 0;
  const minVariantPrice = getMinVariantPrice(product.variants);
  const priceLabel = hasDirectPrice
    ? `$${product.price!.toLocaleString("es-AR")}`
    : minVariantPrice != null
      ? `desde $${minVariantPrice.toLocaleString("es-AR")}`
      : "Consultar";

  return (
    <Card className="flex h-full flex-col overflow-hidden ">
      <Link href={`/products/${product.slug}`}>
      <div className="relative h-56 w-full shrink-0">
        <Image
          src={imageUrl}
          alt={product.name}
          fill
          className="object-contain"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      </div>
      <CardContent className="flex-1 py-4">
        <div className=" flex flex-col  items-center justify-between">
          <h3 className="text-base font-semibold text-center">{product.name}</h3>
          <span className="text-sm font-medium">{priceLabel}</span>
        </div>
        {/* <p className="text-sm text-muted-foreground">{product.description}</p> */}
      </CardContent>
    
       </Link>
       
    </Card>
  );
}

