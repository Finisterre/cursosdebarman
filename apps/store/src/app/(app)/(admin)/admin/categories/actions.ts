"use server";

import { deleteCategory } from "@/lib/categories";

export async function deleteCategoryAction(
  id: string
): Promise<{ ok: boolean; error?: string }> {
  if (!id) return { ok: false, error: "ID requerido" };
  return deleteCategory(id);
}
