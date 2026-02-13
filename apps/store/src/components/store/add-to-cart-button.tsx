"use client";

import { useState } from "react";
import { useCart } from "@/contexts/cart-context";
import type { Product } from "@/types";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const [isAnimating, setIsAnimating] = useState(false);

  const productId = selectedChild?.id ?? product.id;
  const price = selectedChild?.price ?? product.price ?? 0;
  const name = product.name;
  const image_url = product.image_url ?? undefined;
  const sku = selectedChild?.sku ?? product.sku ?? undefined;

  const handleClick = () => {
    addItem({ productId, price, quantity: 1, name, image_url, sku });
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <Button
      disabled={disabled || price <= 0}
      onClick={handleClick}
    >
      Agregar al carrito{" "}
      <ShoppingCart
        size={16}
        className={cn(
          "inline-block transition-transform duration-200 ease-out",
          isAnimating && "scale-150"
        )}
      />
    </Button>
  );
}
