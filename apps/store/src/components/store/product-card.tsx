import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/types";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e";

export function ProductCard({ product }: { product: Product }) {
  const imageUrl = product.image_url ?? FALLBACK_IMAGE;
  const priceLabel =
    product.price != null && product.price > 0
      ? `$${product.price.toLocaleString("es-AR")}`
      : "Consultar";

  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <div className="relative h-56 w-full shrink-0">
        <Image
          src={imageUrl}
          alt={product.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      </div>
      <CardContent className="flex-1 py-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold">{product.name}</h3>
          <span className="text-sm font-medium">{priceLabel}</span>
        </div>
        {/* <p className="text-sm text-muted-foreground">{product.description}</p> */}
      </CardContent>
      <CardFooter className="mt-auto justify-end">
        {/* <Button asChild variant="outline">
          <Link href={`/products/${product.slug}`}>Ver detalle</Link>
        </Button> */}
        <Button asChild>
          <Link href={`/products/${product.slug}`}>Comprar</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

