"use client";

import { useMemo, useState } from "react";
import type { Category, Product } from "@/types";
import { ProductList } from "@/components/store/product-list";
import { BannerImage } from "@/components/store/banner-image";
import {
  VariantFilters,
  filterProductsByVariantValues,
} from "@/components/store/variant-filters";
import {
  PriceFilter,
  filterProductsByPrice,
} from "@/components/store/price-filter";

type CategoryFilterViewProps = {
  category: Category;
  products: Product[];
};

type CategoryOption = {
  id: string;
  label: string;
  depth: number;
  descendantIds: string[];
};

function collectCategoryIds(category: Category): string[] {
  const ids = [category.id];
  if (category.children && category.children.length > 0) {
    category.children.forEach((child) => {
      ids.push(...collectCategoryIds(child));
    });
  }
  return ids;
}

function buildOptions(category: Category, depth = 0): CategoryOption[] {
  const children = category.children ?? [];
  const options: CategoryOption[] = [];
  children.forEach((child) => {
    const prefix = depth > 0 ? `${"-- ".repeat(depth)}` : "";
    options.push({
      id: child.id,
      label: `${prefix}${child.name}`,
      depth,
      descendantIds: collectCategoryIds(child)
    });
    if (child.children && child.children.length > 0) {
      options.push(...buildOptions(child, depth + 1));
    }
  });
  return options;
}

export function CategoryFilterView({ category, products }: CategoryFilterViewProps) {
  const options = useMemo(() => buildOptions(category), [category]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedVariantValueIds, setSelectedVariantValueIds] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 500_000 });

  const filteredByCategory = useMemo(() => {
    if (selectedIds.length === 0) {
      return products;
    }
    const allowedIds = new Set<string>();
    options.forEach((option) => {
      if (selectedIds.includes(option.id)) {
        option.descendantIds.forEach((id) => allowedIds.add(id));
      }
    });
    return products.filter((product) => {
      if (!product.category_id) {
        return false;
      }
      return allowedIds.has(product.category_id);
    });
  }, [products, selectedIds, options]);

  const filteredByVariant = useMemo(
    () => filterProductsByVariantValues(filteredByCategory, selectedVariantValueIds),
    [filteredByCategory, selectedVariantValueIds]
  );

  const filteredProducts = useMemo(
    () =>
      filterProductsByPrice(
        filteredByVariant,
        priceRange.min,
        priceRange.max
      ),
    [filteredByVariant, priceRange.min, priceRange.max]
  );

  const showBanner = !category.parent_id && category.banner;

  return (
    <div className="space-y-6">
       <h1 className="text-2xl font-semibold">{category.name}</h1>
      {showBanner && (
        <div className="w-full overflow-hidden rounded-lg">
          <BannerImage banner={category.banner!} className="aspect-[1920/500] w-full" />
        </div>
      )}
      <div className="grid gap-8 md:grid-cols-[240px_1fr]">
      <aside className="space-y-4 rounded-lg  bg-muted/10 p-4">
        {/* <div>
          <p className="text-xs uppercase tracking-wide text-white">Categoría</p>
          <h2 className="text-base font-semibold">{category.name}</h2>
        </div> */}
        <div className="space-y-2">
        {options.length > 0 ? (
          <>
          <div className="flex items-center gap-2 border-b border-white/30 pb-2 uppercase mb-4">
          <p className="text-lg uppercase tracking-wide text-white">Categorías</p>
          </div>
            <div className="space-y-2">
              {options.map((option) => (
                <label key={option.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(option.id)}
                    onChange={(event) => {
                      const checked = event.target.checked;
                      setSelectedIds((prev) =>
                        checked ? [...prev, option.id] : prev.filter((id) => id !== option.id)
                      );
                    }}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
            </>
          ) : (
            ""
        
          )}
        </div>
        <VariantFilters
          products={filteredByCategory}
          selectedValueIds={selectedVariantValueIds}
          onSelectionChange={setSelectedVariantValueIds}
        />
        <PriceFilter
          minPrice={priceRange.min}
          maxPrice={priceRange.max}
          onRangeChange={(min, max) => setPriceRange({ min, max })}
        />
      </aside>
      <div className="">
        <div>
         
          {category.description && (
            <p className="text-sm text-white">{category.description}</p>
          )}
        </div>

        {filteredProducts.length > 0 ? (
          <ProductList products={filteredProducts} />
        ) : (
          <p className="text-sm text-white">
            No hay productos disponibles en esta categoría.
          </p>
        )}
      </div>
      </div>
    </div>
  );
}
