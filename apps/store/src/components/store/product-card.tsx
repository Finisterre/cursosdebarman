import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/types";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e";

function getMinVariantPrice(variants: Product[] | undefined): number | null {
  if (!variants?.length) return null;
  const prices = variants
    .map((v) => v.sale_price != null && v.sale_price > 0 ? v.sale_price : v.price)
    .filter((p): p is number => p != null && p > 0);
  return prices.length ? Math.min(...prices) : null;
}

function getMinVariantRegularPrice(variants: Product[] | undefined): number | null {
  if (!variants?.length) return null;
  const prices = variants
    .map((v) => v.price)
    .filter((p): p is number => p != null && p > 0);
  return prices.length ? Math.min(...prices) : null;
}

export function ProductCard({ product }: { product: Product }) {
  const imageUrl = product.image_url ?? FALLBACK_IMAGE;
  const hasVariants = (product.variants?.length ?? 0) > 0;
  const hasSale = product.sale_price != null && product.sale_price > 0;
  const regularPrice = hasVariants ? getMinVariantRegularPrice(product.variants) : (product.price ?? null);
  const sellingPrice = hasVariants
    ? getMinVariantPrice(product.variants)
    : (hasSale ? product.sale_price! : product.price ?? null);
  const hasSalePriceSet = hasVariants
    ? (product.variants?.some((v) => v.sale_price != null && v.sale_price > 0) ?? false)
    : hasSale;
  const showStrike =
    hasSalePriceSet &&
    regularPrice != null &&
    sellingPrice != null &&
    regularPrice > sellingPrice;

  const priceLabel = hasVariants
    ? sellingPrice != null
      ? `desde $${sellingPrice.toLocaleString("es-AR")}`
      : "Consultar"
    : sellingPrice != null && sellingPrice > 0
      ? `$${sellingPrice.toLocaleString("es-AR")}`
      : "Consultar";

  return (
    <Card className="flex h-full flex-col overflow-hidden ">
      <Link href={`/products/${product.slug}`}>
      <div className="w-full shrink-0">
        <Image
          src={imageUrl}
          alt={product.name}
          title={product.name || "fs-shop"}
          width={281}
          height={500}
          className="object-cover"
        />
      </div>
      <CardContent className="flex-1 py-4">
        <div className=" flex flex-col  items-start justify-start">
          <h3 className="text-base font-semibold text-center">{product.name}</h3>
          <div className="flex flex-wrap items-baseline justify-center gap-2 text-sm font-medium">
            {showStrike && regularPrice != null && regularPrice > 0 && (
              <span className="text-muted-foreground line-through">
                ${regularPrice.toLocaleString("es-AR")}
              </span>
            )}
            <span>{priceLabel}</span>
          </div>
        </div>
        {/* <p className="text-sm text-muted-foreground">{product.description}</p> */}
      </CardContent>
    
       </Link>
       
    </Card>
  );
}

