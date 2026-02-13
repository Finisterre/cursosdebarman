"use client";

import { useCart } from "@/contexts/cart-context";
import type { Product } from "@/types";
import { Button } from "@/components/ui/button";

type AddToCartButtonProps = {
  product: Product;
  selectedChild?: Product | null;
  disabled?: boolean;
};

export function AddToCartButton({
  product,
  selectedChild,
  disabled = false,
}: AddToCartButtonProps) {
  const { addItem } = useCart();

  const productId = selectedChild?.id ?? product.id;
  const price = selectedChild?.price ?? product.price ?? 0;
  const name = product.name;
  const image_url = product.image_url ?? undefined;

  return (
    <Button
      disabled={disabled || price <= 0}
      onClick={() => {
        addItem({ productId, price, quantity: 1, name, image_url });
      }}
    >
      Agregar al carrito
    </Button>
  );
}
