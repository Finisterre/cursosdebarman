"use client";

import type { Product } from "@/types";
import { Slider } from "@/components/ui/slider";

const PRICE_MIN = 0;
const PRICE_MAX = 1_000_000;

/** Precio efectivo (de venta) para filtrar y mostrar: oferta si existe, sino precio normal. */
export function getEffectivePrice(product: Product): number | null {
  const sale = product.sale_price != null && product.sale_price > 0 ? product.sale_price : null;
  const regular = product.price != null && product.price > 0 ? product.price : null;
  if (product.variants?.length) {
    const prices = product.variants
      .map((v) => (v.sale_price != null && v.sale_price > 0 ? v.sale_price : v.price))
      .filter((p): p is number => p != null && p > 0);
    return prices.length ? Math.min(...prices) : (sale ?? regular);
  }
  return sale ?? regular;
}

export function filterProductsByPrice(
  products: Product[],
  minPrice: number,
  maxPrice: number
): Product[] {
  if (minPrice <= PRICE_MIN && maxPrice >= PRICE_MAX) return products;
  return products.filter((p) => {
    const price = getEffectivePrice(p);
    if (price == null) return false;
    return price >= minPrice && price <= maxPrice;
  });
}

type PriceFilterProps = {
  minPrice: number;
  maxPrice: number;
  onRangeChange: (min: number, max: number) => void;
  /** Rango total del slider (valores posibles). */
  rangeMin?: number;
  rangeMax?: number;
};

export function PriceFilter({
  minPrice,
  maxPrice,
  onRangeChange,
  rangeMin = PRICE_MIN,
  rangeMax = PRICE_MAX,
}: PriceFilterProps) {
  const formatPrice = (n: number) => {
    if (n >= 1_000_000) return "$1M+";
    return `$${Math.round(n).toLocaleString("es-AR")}`;
  };

  return (
    <div className="space-y-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">Precio</p>
      <div className="space-y-3">
        <Slider
          min={rangeMin}
          max={rangeMax}
          step={1000}
          minStepsBetweenThumbs={1}
          value={[minPrice, maxPrice]}
          onValueChange={(v) => {
            const a = v[0] ?? minPrice;
            const b = v[1] ?? maxPrice;
            onRangeChange(Math.min(a, b), Math.max(a, b));
          }}
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{formatPrice(minPrice)}</span>
          <span>{formatPrice(maxPrice)}</span>
        </div>
      </div>
    </div>
  );
}
