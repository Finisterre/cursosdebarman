import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/types";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Card className="overflow-hidden">
      <div className="relative h-56 w-full">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      </div>
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold">{product.name}</h3>
          <span className="text-sm font-medium">${product.price.toLocaleString("es-AR")}</span>
        </div>
        <p className="text-sm text-muted-foreground">{product.description}</p>
      </CardContent>
      <CardFooter className="justify-between">
        <Button asChild variant="outline">
          <Link href={`/products/${product.slug}`}>Ver detalle</Link>
        </Button>
        <Button asChild>
          <Link href={`/products/${product.slug}`}>Comprar</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

