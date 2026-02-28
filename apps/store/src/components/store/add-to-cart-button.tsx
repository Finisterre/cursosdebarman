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
  const hasSaleChild = selectedChild?.sale_price != null && selectedChild.sale_price > 0;
  const hasSaleProduct = product.sale_price != null && product.sale_price > 0;
  const price =
    selectedChild != null
      ? (hasSaleChild ? selectedChild.sale_price! : selectedChild.price) ?? 0
      : (hasSaleProduct ? product.sale_price! : product.price) ?? 0;
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
      className="bg-[#882c0b] text-white hover:bg-orange-500/70 rounded-full"
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
