"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function deleteProductAction(
  productId: string
): Promise<{ ok: boolean; error?: string }> {
  if (!productId) return { ok: false, error: "ID de producto requerido" };
  const { error } = await supabaseAdmin.from("products").delete().eq("id", productId);
  if (error) {
    console.error("[products] deleteProductAction", error);
    return { ok: false, error: error.message };
  }
  revalidatePath("/admin/products");
  return { ok: true };
}
