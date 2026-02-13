"use server";

import { supabaseAdmin } from "@/lib/supabase/admin";
import {
  buildVariantCombinations,
  createVariantProducts,
  type OptionByType,
} from "@/lib/products";

export async function regenerateVariantsAction(
  productId: string,
  variantOptions: Record<string, OptionByType[]>,
  defaultPrice: number | null = null,
  defaultStock: number = 0
): Promise<{ ok: boolean; error?: string }> {
  if (!productId) return { ok: false, error: "productId requerido" };
  const hasOptions =
    Object.keys(variantOptions).length > 0 &&
    Object.values(variantOptions).every((arr) => arr.length > 0);
  if (!hasOptions) return { ok: false, error: "Seleccioná al menos un valor por tipo." };
  const combinations = buildVariantCombinations(variantOptions);
  return createVariantProducts(productId, combinations, defaultPrice, defaultStock);
}

export async function updateProductPriceStockAction(
  productId: string,
  price: number | null,
  stock: number | null
): Promise<{ ok: boolean; error?: string }> {
  if (!productId) return { ok: false, error: "productId requerido" };
  const { error } = await supabaseAdmin
    .from("products")
    .update({
      price: price ?? null,
      stock: stock ?? null,
    })
    .eq("id", productId);
  if (error) {
    console.error("[edit] updateProductPriceStock", error);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

export async function deleteVariantChildAction(
  productId: string
): Promise<{ ok: boolean; error?: string }> {
  if (!productId) return { ok: false, error: "productId requerido" };
  const { error } = await supabaseAdmin.from("products").delete().eq("id", productId);
  if (error) {
    console.error("[edit] deleteVariantChild", error);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}
