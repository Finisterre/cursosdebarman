"use client";

import { useMemo, useState } from "react";
import type { Category, Product } from "@/types";
import { ProductList } from "@/components/store/product-list";
import { BannerImage } from "@/components/store/banner-image";

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

  const filteredProducts = useMemo(() => {
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

  const showBanner = !category.parent_id && category.banner;

  return (
    <div className="space-y-6">
      {showBanner && (
        <div className="w-full overflow-hidden rounded-lg">
          <BannerImage banner={category.banner!} className="aspect-[1920/500] w-full" />
        </div>
      )}
      <div className="grid gap-8 md:grid-cols-[240px_1fr]">
      <aside className="space-y-4 rounded-lg border bg-muted/20 p-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Categoría</p>
          <h2 className="text-base font-semibold">{category.name}</h2>
        </div>
        <div className="space-y-2">
        {options.length > 0 ? (
          <>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Subcategorías</p>
         
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
      </aside>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">{category.name}</h1>
          {category.description && (
            <p className="text-sm text-muted-foreground">{category.description}</p>
          )}
        </div>

        {filteredProducts.length > 0 ? (
          <ProductList products={filteredProducts} />
        ) : (
          <p className="text-sm text-muted-foreground">
            No hay productos disponibles en esta categoría.
          </p>
        )}
      </div>
      </div>
    </div>
  );
}
