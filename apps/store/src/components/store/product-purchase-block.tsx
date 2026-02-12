"use client";

import { useState } from "react";
import type { Product, ProductVariant } from "@/types";
import { ProductVariantSelector } from "@/components/store/product-variant-selector";
import { AddToCartButton } from "@/components/store/add-to-cart-button";

type ProductPurchaseBlockProps = {
  product: Product;
};

export function ProductPurchaseBlock({ product }: ProductPurchaseBlockProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

  const variants = product.variants ?? [];
  const hasVariants = variants.length > 0;
  const mustSelectVariant = hasVariants && !selectedVariant;

  return (
    <div className="space-y-4">
      {hasVariants ? (
        <ProductVariantSelector
          product={product}
          selectedVariantId={selectedVariant?.id ?? null}
          onSelect={(v) => setSelectedVariant(v)}
        />
      ) : (
        <p className="text-lg font-semibold">
          ${product.price.toLocaleString("es-AR")}
        </p>
      )}

      <AddToCartButton
        product={product}
        selectedVariant={selectedVariant}
        disabled={mustSelectVariant}
      />
    </div>
  );
}
