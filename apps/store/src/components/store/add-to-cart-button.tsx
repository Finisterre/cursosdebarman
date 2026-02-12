"use client";

import { useCart } from "@/contexts/cart-context";
import type { Product } from "@/types";
import { Button } from "@/components/ui/button";

export function AddToCartButton({ product }: { product: Product }) {
  const { addItem } = useCart();

  return (
    <Button
      onClick={() => {
        addItem(product);
      }}
    >
      Agregar al carrito
    </Button>
  );
}

