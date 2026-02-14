"use server";

import { revalidatePath } from "next/cache";
import { deleteBanner } from "@/lib/banners";

export async function deleteBannerAction(
  id: string
): Promise<{ ok: boolean; error?: string }> {
  if (!id) return { ok: false, error: "ID requerido" };
  const result = await deleteBanner(id);
  if (result.ok) {
    revalidatePath("/admin/banners");
  }
  return result;
}
