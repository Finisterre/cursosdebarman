"use client";

import { useCart } from "@/contexts/cart-context";
import type { Product, ProductVariant } from "@/types";
import { Button } from "@/components/ui/button";

type AddToCartButtonProps = {
  product: Product;
  selectedVariant?: ProductVariant | null;
  disabled?: boolean;
};

export function AddToCartButton({
  product,
  selectedVariant,
  disabled = false,
}: AddToCartButtonProps) {
  const { addItem } = useCart();

  return (
    <Button
      disabled={disabled}
      onClick={() => {
        addItem(product, selectedVariant);
      }}
    >
      Agregar al carrito
    </Button>
  );
}

