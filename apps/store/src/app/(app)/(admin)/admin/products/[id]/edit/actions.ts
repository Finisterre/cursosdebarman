"use server";

import { saveProductVariants, type ProductVariantInput } from "@/lib/variants";

export async function saveVariantsAction(
  productId: string,
  variants: ProductVariantInput[]
): Promise<{ ok: boolean; error?: string }> {
  if (!productId) {
    return { ok: false, error: "productId requerido" };
  }
  return saveProductVariants(productId, variants);
}
