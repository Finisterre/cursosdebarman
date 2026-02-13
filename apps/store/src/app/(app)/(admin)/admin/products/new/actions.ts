"use server";

import {
  createSimpleProduct,
  createConfigurableProduct,
  buildVariantCombinations,
  createVariantProducts,
  type OptionByType,
} from "@/lib/products";

export type CreateProductPayload = {
  name: string;
  slug: string;
  description: string;
  category_id?: string | null;
  featured?: boolean;
  price?: number | null;
  variantOptions?: Record<string, OptionByType[]> | null;
};

export async function createProductAction(
  payload: CreateProductPayload
): Promise<{ ok: boolean; id?: string; error?: string }> {
  const hasVariants =
    payload.variantOptions &&
    Object.keys(payload.variantOptions).length > 0 &&
    Object.values(payload.variantOptions).every((arr) => arr.length > 0);

  if (!hasVariants) {
    const price = payload.price != null ? Number(payload.price) : null;
    if (price == null || price < 0) {
      return { ok: false, error: "El precio es requerido para productos simples." };
    }
    return createSimpleProduct({
      name: payload.name.trim(),
      slug: payload.slug.trim().toLowerCase().replace(/\s+/g, "-"),
      description: payload.description.trim(),
      price,
      category_id: payload.category_id ?? null,
      featured: payload.featured ?? false,
    });
  }

  const result = await createConfigurableProduct({
    name: payload.name.trim(),
    slug: payload.slug.trim().toLowerCase().replace(/\s+/g, "-"),
    description: payload.description.trim(),
    category_id: payload.category_id ?? null,
    featured: payload.featured ?? false,
  });

  if (!result.ok || !result.id) return result;

  const combinations = buildVariantCombinations(payload.variantOptions!);
  const variantResult = await createVariantProducts(result.id, combinations);
  if (!variantResult.ok) {
    return { ok: false, error: variantResult.error };
  }
  return { ok: true, id: result.id };
}
