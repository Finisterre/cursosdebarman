import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { ProductVariant, VariantType, VariantOption } from "@/types";

type VariantTypeRow = {
  id: string;
  name: string;
  slug: string;
  created_at: string;
};

type VariantOptionRow = {
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
    createdAt: row.created_at,
  };
}

function mapVariantOption(row: VariantOptionRow): VariantOption {
  return {
    id: row.id,
    variantTypeId: row.variant_type_id,
    value: row.value,
    createdAt: row.created_at,
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

export async function getVariantOptionsByType(typeId: string): Promise<VariantOption[]> {
  const { data, error } = await supabaseServer
    .from("variant_options")
    .select("id, variant_type_id, value, created_at")
    .eq("variant_type_id", typeId)
    .order("value");

  if (error) {
    console.error("[variants] getVariantOptionsByType", typeId, error);
    return [];
  }
  return (data ?? []).map((r) => mapVariantOption(r as VariantOptionRow));
}

export async function getAllVariantOptions(): Promise<VariantOption[]> {
  const { data, error } = await supabaseServer
    .from("variant_options")
    .select("id, variant_type_id, value, created_at")
    .order("value");

  if (error) {
    console.error("[variants] getAllVariantOptions", error);
    return [];
  }
  return (data ?? []).map((r) => mapVariantOption(r as VariantOptionRow));
}

type VariantOptionJoin = {
  value: string;
  variant_types: { name: string } | null;
};

function parseVariantOption(
  opt: VariantOptionJoin | VariantOptionJoin[] | null | undefined
): { name: string; value: string } {
  const single = Array.isArray(opt) ? opt[0] : opt;
  return {
    name: single?.variant_types?.name ?? "",
    value: single?.value ?? "",
  };
}

export async function getProductVariants(productId: string): Promise<ProductVariant[]> {
  const { data, error } = await supabaseServer
    .from("product_variants")
    .select(
      `
      id,
      product_id,
      variant_option_id,
      price,
      stock,
      variant_options(value, variant_types(name))
    `
    )
    .eq("product_id", productId);

  if (error) {
    console.error("[variants] getProductVariants", productId, error);
    return [];
  }

  const rows = (data ?? []) as unknown as Array<{
    id: string;
    product_id: string;
    variant_option_id: string;
    price: number;
    stock: number;
    variant_options?: VariantOptionJoin | VariantOptionJoin[] | null;
  }>;

  return rows.map((row) => {
    const { name, value } = parseVariantOption(row.variant_options);
    return {
      id: row.id,
      productId: row.product_id,
      name,
      value,
      price: Number(row.price),
      stock: Number(row.stock),
    };
  });
}

export type ProductVariantForAdmin = ProductVariant & { variantOptionId: string };

export async function getProductVariantsForAdmin(
  productId: string
): Promise<ProductVariantForAdmin[]> {
  const { data, error } = await supabaseServer
    .from("product_variants")
    .select(
      `
      id,
      product_id,
      variant_option_id,
      price,
      stock,
      variant_options(value, variant_types(name))
    `
    )
    .eq("product_id", productId);

  if (error) {
    console.error("[variants] getProductVariantsForAdmin", productId, error);
    return [];
  }

  const rows = (data ?? []) as unknown as Array<{
    id: string;
    product_id: string;
    variant_option_id: string;
    price: number;
    stock: number;
    variant_options?: VariantOptionJoin | VariantOptionJoin[] | null;
  }>;

  return rows.map((row) => {
    const { name, value } = parseVariantOption(row.variant_options);
    return {
      id: row.id,
      productId: row.product_id,
      variantOptionId: row.variant_option_id,
      name,
      value,
      price: Number(row.price),
      stock: Number(row.stock),
    };
  });
}

export type ProductVariantInput = {
  variantOptionId: string;
  price: number;
  stock: number;
};

export async function saveProductVariants(
  productId: string,
  variants: ProductVariantInput[]
): Promise<{ ok: boolean; error?: string }> {
  const { error: deleteError } = await supabaseAdmin
    .from("product_variants")
    .delete()
    .eq("product_id", productId);

  if (deleteError) {
    console.error("[variants] saveProductVariants delete", deleteError);
    return { ok: false, error: deleteError.message };
  }

  if (variants.length === 0) {
    return { ok: true };
  }

  const rows = variants.map((v) => ({
    product_id: productId,
    variant_option_id: v.variantOptionId,
    price: v.price,
    stock: v.stock,
  }));

  const { error: insertError } = await supabaseAdmin.from("product_variants").insert(rows);

  if (insertError) {
    console.error("[variants] saveProductVariants insert", insertError);
    return { ok: false, error: insertError.message };
  }

  return { ok: true };
}
