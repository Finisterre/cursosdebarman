"use client";

import { useMemo } from "react";
import type { Product, ProductVariantValue } from "@/types";

export type VariantFilterOption = {
  typeId: string;
  typeName: string;
  values: { valueId: string; value: string }[];
};

/** Construye las opciones de filtro a partir de los productos (tipos y valores que aparecen en sus variantes). */
export function buildVariantFilterOptions(products: Product[]): VariantFilterOption[] {
  const byType = new Map<string, { typeName: string; values: Map<string, string> }>();

  for (const product of products) {
    for (const variant of product.variants ?? []) {
      for (const vv of variant.variantValues ?? []) {
        const typeId = vv.variantTypeId;
        const typeName = vv.variantTypeName || "Variante";
        if (!byType.has(typeId)) {
          byType.set(typeId, { typeName, values: new Map() });
        }
        const entry = byType.get(typeId)!;
        entry.values.set(vv.valueId, vv.value);
      }
    }
  }

  return Array.from(byType.entries()).map(([typeId, { typeName, values }]) => ({
    typeId,
    typeName,
    values: Array.from(values.entries()).map(([valueId, value]) => ({ valueId, value })),
  }));
}

/** Filtra productos: se mantienen los que tienen al menos una variante con todos los valueIds seleccionados (AND). */
export function filterProductsByVariantValues(
  products: Product[],
  selectedValueIds: string[]
): Product[] {
  if (selectedValueIds.length === 0) return products;

  return products.filter((product) =>
    (product.variants ?? []).some((variant) => {
      const variantValueIds = (variant.variantValues ?? []).map((vv) => vv.valueId);
      return selectedValueIds.every((id) => variantValueIds.includes(id));
    })
  );
}

type VariantFiltersProps = {
  products: Product[];
  selectedValueIds: string[];
  onSelectionChange: (valueIds: string[]) => void;
};

export function VariantFilters({
  products,
  selectedValueIds,
  onSelectionChange,
}: VariantFiltersProps) {
  const options = useMemo(() => buildVariantFilterOptions(products), [products]);

  const toggle = (valueId: string) => {
    if (selectedValueIds.includes(valueId)) {
      onSelectionChange(selectedValueIds.filter((id) => id !== valueId));
    } else {
      onSelectionChange([...selectedValueIds, valueId]);
    }
  };

  if (options.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* <p className="text-xs uppercase tracking-wide text-white">Variantes</p> */}
      {options.map((opt) => (
        <div key={opt.typeId} className="space-y-2">
          <p className="text-sm font-medium">{opt.typeName}</p>
          <div className="space-y-2">
            {opt.values.map((v) => (
              <label key={v.valueId} className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={selectedValueIds.includes(v.valueId)}
                  onChange={() => toggle(v.valueId)}
                />
                <span>{v.value}</span>
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
