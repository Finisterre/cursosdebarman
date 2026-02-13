import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { VariantType, VariantValue } from "@/types";

type VariantTypeRow = {
  id: string;
  name: string;
  slug: string;
  created_at: string;
};

type VariantValueRow = {
  id: string;
  variant_type_id: string;
  value: string;
  created_at: string;
};

function mapVariantType(row: VariantTypeRow): VariantType {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
  };
}

function mapVariantValue(row: VariantValueRow): VariantValue {
  return {
    id: row.id,
    variantTypeId: row.variant_type_id,
    value: row.value,
  };
}

export async function getVariantTypes(): Promise<VariantType[]> {
  const { data, error } = await supabaseServer
    .from("variant_types")
    .select("id, name, slug, created_at")
    .order("name");

  if (error) {
    console.error("[variants] getVariantTypes", error);
    return [];
  }
  return (data ?? []).map((r) => mapVariantType(r as VariantTypeRow));
}

export async function getVariantValuesByType(typeId: string): Promise<VariantValue[]> {
  const { data, error } = await supabaseServer
    .from("variant_values")
    .select("id, variant_type_id, value, created_at")
    .eq("variant_type_id", typeId)
    .order("value");

  if (error) {
    console.error("[variants] getVariantValuesByType", typeId, error);
    return [];
  }
  return (data ?? []).map((r) => mapVariantValue(r as VariantValueRow));
}

export async function createVariantType(data: {
  name: string;
  slug: string;
}): Promise<{ ok: boolean; id?: string; error?: string }> {
  const slug = data.slug.trim().toLowerCase().replace(/\s+/g, "-");
  const { data: row, error } = await supabaseAdmin
    .from("variant_types")
    .insert({ name: data.name.trim(), slug })
    .select("id")
    .single();

  if (error) {
    console.error("[variants] createVariantType", error);
    return { ok: false, error: error.message };
  }
  return { ok: true, id: row?.id };
}

export async function createVariantValue(data: {
  variantTypeId: string;
  value: string;
}): Promise<{ ok: boolean; id?: string; error?: string }> {
  const value = data.value.trim();
  if (!value) {
    return { ok: false, error: "Valor requerido" };
  }
  const { data: row, error } = await supabaseAdmin
    .from("variant_values")
    .insert({ variant_type_id: data.variantTypeId, value })
    .select("id")
    .single();

  if (error) {
    console.error("[variants] createVariantValue", error);
    return { ok: false, error: error.message };
  }
  return { ok: true, id: row?.id };
}

export async function deleteVariantType(
  id: string
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabaseAdmin.from("variant_types").delete().eq("id", id);
  if (error) {
    console.error("[variants] deleteVariantType", error);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

export async function deleteVariantValue(
  id: string
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabaseAdmin.from("variant_values").delete().eq("id", id);
  if (error) {
    console.error("[variants] deleteVariantValue", error);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

export async function getAllVariantValues(): Promise<VariantValue[]> {
  const { data, error } = await supabaseServer
    .from("variant_values")
    .select("id, variant_type_id, value, created_at")
    .order("value");

  if (error) {
    console.error("[variants] getAllVariantValues", error);
    return [];
  }
  return (data ?? []).map((r) => mapVariantValue(r as VariantValueRow));
}
