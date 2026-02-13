"use server";

import {
  createVariantType,
  createVariantValue,
  deleteVariantType,
  deleteVariantValue,
} from "@/lib/variants";

export async function createVariantTypeAction(formData: FormData) {
  const name = formData.get("name")?.toString()?.trim();
  if (!name) return { ok: false, error: "Nombre requerido" };
  const slug = name.toLowerCase().replace(/\s+/g, "-");
  return createVariantType({ name, slug });
}

export async function createVariantValueAction(formData: FormData) {
  const variantTypeId = formData.get("variantTypeId")?.toString();
  const value = formData.get("value")?.toString()?.trim();
  if (!variantTypeId || !value) return { ok: false, error: "Tipo y valor requeridos" };
  return createVariantValue({ variantTypeId, value });
}

export async function deleteVariantTypeAction(id: string) {
  return deleteVariantType(id);
}

export async function deleteVariantValueAction(id: string) {
  return deleteVariantValue(id);
}
