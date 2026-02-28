"use client";

import { useMemo, useState } from "react";
import type { Product, ProductVariantValue } from "@/types";
import { cn } from "@/lib/utils";

type ProductVariantSelectorProps = {
  product: Product;
  selectedChild: Product | null;
  onSelect: (child: Product | null) => void;
  className?: string;
};

function findMatchingChild(
  children: Product[],
  selectedByType: Record<string, string>
): Product | null {
  const selectedIds = Object.values(selectedByType).filter(Boolean);
  if (selectedIds.length === 0) return null;
  return (
    children.find((child) => {
      const childValueIds = (child.variantValues ?? []).map((v) => v.valueId);
      if (childValueIds.length !== selectedIds.length) return false;
      return selectedIds.every((id) => childValueIds.includes(id));
    }) ?? null
  );
}

export function ProductVariantSelector({
  product,
  selectedChild,
  onSelect,
  className,
}: ProductVariantSelectorProps) {
  const variants = product.variants ?? [];
  const hasVariants = variants.length > 0;

  const { typeOrder, optionsByType } = useMemo(() => {
    const typeOrder: { typeId: string; typeName: string }[] = [];
    const optionsByType: Record<string, ProductVariantValue[]> = {};
    for (const child of variants) {
      for (const pvv of child.variantValues ?? []) {
        if (!optionsByType[pvv.variantTypeId]) {
          typeOrder.push({ typeId: pvv.variantTypeId, typeName: pvv.variantTypeName });
          optionsByType[pvv.variantTypeId] = [];
        }
        const exists = optionsByType[pvv.variantTypeId].some((o) => o.valueId === pvv.valueId);
        if (!exists) {
          optionsByType[pvv.variantTypeId].push(pvv);
        }
      }
    }
    return { typeOrder, optionsByType };
  }, [variants]);

  const [selectedByType, setSelectedByType] = useState<Record<string, string>>({});

  const matchingChild = useMemo(
    () => findMatchingChild(variants, selectedByType),
    [variants, selectedByType]
  );

  const regularPrice = matchingChild?.price ?? product.price ?? null;
  const hasSale =
    (matchingChild?.sale_price != null && matchingChild.sale_price > 0) ||
    (matchingChild == null && product.sale_price != null && product.sale_price > 0);
  const sellingPrice =
    matchingChild != null
      ? (matchingChild.sale_price != null && matchingChild.sale_price > 0 ? matchingChild.sale_price : matchingChild.price) ?? null
      : (product.sale_price != null && product.sale_price > 0 ? product.sale_price : product.price) ?? null;
  const displayStock = matchingChild?.stock ?? product.stock ?? null;
  const outOfStock = displayStock != null && displayStock <= 0;

  const handleSelectValue = (typeId: string, valueId: string) => {
    const next = { ...selectedByType, [typeId]: valueId };
    setSelectedByType(next);
    const child = findMatchingChild(variants, next);
    onSelect(child);
  };

  if (!hasVariants) return null;

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-wrap items-baseline gap-2">
        <span className="text-sm font-medium text-muted-foreground">Precio:</span>
        {hasSale && regularPrice != null && regularPrice > 0 && (
          <span className="text-lg font-semibold text-muted-foreground line-through">
            ${regularPrice.toLocaleString("es-AR")}
          </span>
        )}
        <span className="text-lg font-semibold">
          {sellingPrice != null && sellingPrice > 0
            ? `$${sellingPrice.toLocaleString("es-AR")}`
            : matchingChild != null
              ? "Consultar"
              : "Elegí una opción"}
        </span>
        {displayStock != null && (
          <span className="text-xs text-muted-foreground">
            {displayStock != null && displayStock > 0
              ? `${displayStock} en stock`
              : matchingChild != null
                ? "Sin stock"
                : ""}
          </span>
        )}
      </div>
      <div className="space-y-3">
        {typeOrder.map(({ typeId, typeName }) => {
          const options = optionsByType[typeId] ?? [];
          return (
            <div key={typeId}>
              <p className="text-sm font-medium mb-2">{typeName}</p>
              <div className="flex flex-wrap gap-2">
                {options.map((opt) => {
                  const isSelected = selectedByType[typeId] === opt.valueId;
                  return (
                    <button
                      key={opt.valueId}
                      type="button"
                      onClick={() => handleSelectValue(typeId, opt.valueId)}
                      className={cn(
                        "rounded-none bg-[#404040]  px-3 py-2 text-sm ",
                        isSelected
                          ? "border-none bg-white/10 bg-[#008060] font-medium"
                          : "hover:bg-muted/50"
                      )}
                    >
                      {opt.value}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
