"use client";

import { useState } from "react";
import type { Product } from "@/types";
import { ProductVariantSelector } from "@/components/store/product-variant-selector";
import { AddToCartButton } from "@/components/store/add-to-cart-button";

type ProductPurchaseBlockProps = {
  product: Product;
  /** Si se provee, se llama al cambiar la variante seleccionada (ej. para actualizar la imagen). */
  onSelectChild?: (child: Product | null) => void;
};

export function ProductPurchaseBlock({ product, onSelectChild }: ProductPurchaseBlockProps) {
  const [selectedChild, setSelectedChild] = useState<Product | null>(null);

  const handleSelect = (child: Product | null) => {
    setSelectedChild(child);
    onSelectChild?.(child);
  };

  const variants = product.variants ?? [];
  const hasVariants = variants.length > 0;
  const effectivePrice = selectedChild?.price ?? product.price;
  const effectiveStock = selectedChild?.stock ?? product.stock;
  const mustSelectVariant = hasVariants && !selectedChild;
  const outOfStock = effectiveStock != null && effectiveStock <= 0;
  const sellableId = selectedChild?.id ?? product.id;

  return (
    <div className="space-y-4">
      {hasVariants ? (
        <ProductVariantSelector
          product={product}
          selectedChild={selectedChild}
          onSelect={handleSelect}
        />
      ) : (
        <p className="text-lg font-semibold">
          {effectivePrice != null ? `$${effectivePrice.toLocaleString("es-AR")}` : "Consultar"}
        </p>
      )}

      <AddToCartButton
        product={product}
        selectedChild={selectedChild}
        disabled={mustSelectVariant || outOfStock}
      />
    </div>
  );
}
