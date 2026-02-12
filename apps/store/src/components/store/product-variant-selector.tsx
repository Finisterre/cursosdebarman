"use client";

import { useMemo, useState } from "react";
import type { Product, ProductVariant } from "@/types";
import { cn } from "@/lib/utils";

type ProductVariantSelectorProps = {
  product: Product;
  onSelect?: (variant: ProductVariant | null) => void;
  selectedVariantId: string | null;
  className?: string;
};

export function ProductVariantSelector({
  product,
  onSelect,
  selectedVariantId,
  className,
}: ProductVariantSelectorProps) {
  const variants = product.variants ?? [];
  const [selected, setSelected] = useState<string | null>(selectedVariantId);

  const minPrice = useMemo(() => {
    if (variants.length === 0) return product.price;
    return Math.min(...variants.map((v) => v.price));
  }, [variants, product.price]);

  const selectedVariant = variants.find((v) => v.id === selected);
  const displayPrice = selectedVariant ? selectedVariant.price : minPrice;

  const handleSelect = (variant: ProductVariant) => {
    const newId = selected === variant.id ? null : variant.id;
    setSelected(newId);
    onSelect?.(
      newId ? variants.find((v) => v.id === newId) ?? null : null
    );
  };

  if (variants.length === 0) return null;

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-wrap items-baseline gap-2">
        <span className="text-sm font-medium text-muted-foreground">Precio:</span>
        <span className="text-lg font-semibold">
          ${displayPrice.toLocaleString("es-AR")}
        </span>
        {!selectedVariant && variants.length > 1 && (
          <span className="text-xs text-muted-foreground">
            (precio mínimo; elegí una variante)
          </span>
        )}
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium">Elegí tu variante</p>
        <ul className="space-y-2">
          {variants.map((variant) => {
            const isSelected = selected === variant.id;
            const outOfStock = variant.stock <= 0;
            return (
              <li key={variant.id}>
                <button
                  type="button"
                  onClick={() => !outOfStock && handleSelect(variant)}
                  disabled={outOfStock}
                  className={cn(
                    "flex w-full flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2 text-left text-sm transition-colors",
                    isSelected
                      ? "border-primary bg-primary/10 font-medium"
                      : "hover:bg-muted/50",
                    outOfStock && "cursor-not-allowed opacity-60"
                  )}
                >
                  <span>
                    {variant.name}: <strong>{variant.value}</strong>
                  </span>
                  <span className="text-muted-foreground">
                    ${variant.price.toLocaleString("es-AR")}
                    {variant.stock >= 0 && (
                      <span className="ml-2">
                        · {variant.stock} en stock
                      </span>
                    )}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
