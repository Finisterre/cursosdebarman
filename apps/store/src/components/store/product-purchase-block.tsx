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
  const hasSale = product.sale_price != null && product.sale_price > 0;
  const regularPrice = product.price ?? null;
  const sellingPrice = hasSale ? product.sale_price! : (product.price ?? null);
  const effectiveStock = selectedChild?.stock ?? product.stock;
  const mustSelectVariant = hasVariants && !selectedChild;
  const outOfStock = effectiveStock != null && effectiveStock <= 0;

  return (
    <div className="space-y-4">
      {hasVariants ? (
        <ProductVariantSelector
          product={product}
          selectedChild={selectedChild}
          onSelect={handleSelect}
        />
      ) : (
        <div className="flex flex-wrap items-baseline gap-2">
          {hasSale && regularPrice != null && regularPrice > 0 && (
            <p className="text-lg font-semibold text-muted-foreground line-through">
              ${regularPrice.toLocaleString("es-AR")}
            </p>
          )}
          <p className="text-lg font-semibold">
            {sellingPrice != null && sellingPrice > 0
              ? `$${sellingPrice.toLocaleString("es-AR")}`
              : "Consultar"}
          </p>
          {effectiveStock != null && (
            <span className="text-sm text-muted-foreground">
              {effectiveStock > 0 ? `${effectiveStock} en stock` : "Sin stock"}
            </span>
          )}
        </div>
      )}

      <AddToCartButton
        product={product}
        selectedChild={selectedChild}
        disabled={mustSelectVariant || outOfStock}
      />
    </div>
  );
}
