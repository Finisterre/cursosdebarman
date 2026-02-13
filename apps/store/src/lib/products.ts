import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getVariantTypes, getVariantValuesByType } from "@/lib/variants";
import type { Product, ProductVariantValue } from "@/types";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e";

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number | null;
  sale_price: number | null;
  stock: number | null;
  is_active: boolean | null;
  image_url: string | null;
  featured: boolean | null;
  category_id: string | null;
  parent_product_id: string | null;
  sku: string | null;
  is_variant: boolean | null;
};

function mapProductRow(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? "",
    price: row.price != null ? Number(row.price) : null,
    sale_price: row.sale_price != null ? Number(row.sale_price) : null,
    stock: row.stock != null ? Number(row.stock) : null,
    image_url: row.image_url ?? null,
    featured: row.featured ?? false,
    category_id: row.category_id ?? null,
    parent_product_id: row.parent_product_id ?? null,
    sku: row.sku ?? null,
    is_variant: row.is_variant ?? false,
  };
}

export function generateSku(parentSlug: string, values: string[]): string {
  const parts = [parentSlug, ...values].map((s) =>
    String(s)
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
  );
  return parts.filter(Boolean).join("-");
}

export function generateVariantCombinations(
  optionsByType: Record<string, string[]>
): string[][] {
  const typeIds = Object.keys(optionsByType);
  if (typeIds.length === 0) return [];
  if (typeIds.length === 1) {
    const ids = optionsByType[typeIds[0]] ?? [];
    return ids.map((id) => [id]);
  }
  const [firstTypeId, ...restTypeIds] = typeIds;
  const firstOptions = optionsByType[firstTypeId] ?? [];
  const restCombinations = generateVariantCombinations(
    restTypeIds.reduce((acc, id) => ({ ...acc, [id]: optionsByType[id] ?? [] }), {})
  );
  const result: string[][] = [];
  for (const optionId of firstOptions) {
    for (const rest of restCombinations) {
      result.push([optionId, ...rest]);
    }
  }
  return result;
}

export type OptionByType = { id: string; value: string };

export function buildVariantCombinations(
  optionsByType: Record<string, OptionByType[]>
): { valueIds: string[]; valueLabels: string[] }[] {
  const typeIds = Object.keys(optionsByType);
  if (typeIds.length === 0) return [];
  if (typeIds.length === 1) {
    const opts = optionsByType[typeIds[0]] ?? [];
    return opts.map((o) => ({ valueIds: [o.id], valueLabels: [o.value] }));
  }
  const [firstTypeId, ...restTypeIds] = typeIds;
  const firstOpts = optionsByType[firstTypeId] ?? [];
  const restByType = restTypeIds.reduce(
    (acc, id) => ({ ...acc, [id]: optionsByType[id] ?? [] }),
    {} as Record<string, OptionByType[]>
  );
  const restCombinations = buildVariantCombinations(restByType);
  const result: { valueIds: string[]; valueLabels: string[] }[] = [];
  for (const first of firstOpts) {
    for (const rest of restCombinations) {
      result.push({
        valueIds: [first.id, ...rest.valueIds],
        valueLabels: [first.value, ...rest.valueLabels],
      });
    }
  }
  return result;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await supabaseServer
    .from("products")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !data) return null;
  return mapProductRow(data as ProductRow);
}

export async function getProductWithVariants(slug: string): Promise<Product | null> {
  const product = await getProductBySlug(slug);
  if (!product) return null;
  if (product.is_variant && product.parent_product_id) {
    const parent = await getProductById(product.parent_product_id);
    if (!parent) return product;
    return getProductWithVariants(parent.slug);
  }
  const children = await getChildProducts(product.id);
  if (children.length === 0) return { ...product, variants: [] };

  const childrenWithValues: Product[] = await Promise.all(
    children.map(async (child) => {
      const values = await getProductVariantValues(child.id);
      return { ...child, variantValues: values };
    })
  );

  return {
    ...product,
    variants: childrenWithValues,
  };
}

export async function getProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabaseServer
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return mapProductRow(data as ProductRow);
}

export async function getChildProducts(parentId: string): Promise<Product[]> {
  const { data, error } = await supabaseServer
    .from("products")
    .select("*")
    .eq("parent_product_id", parentId)
    .order("slug");

  if (error) {
    console.error("[products] getChildProducts", parentId, error);
    return [];
  }
  return (data ?? []).map((r) => mapProductRow(r as ProductRow));
}

/** Trae en una sola query todos los hijos de los productos padre (para listados). */
async function getChildProductsByParentIds(parentIds: string[]): Promise<Product[]> {
  if (parentIds.length === 0) return [];
  const { data, error } = await supabaseServer
    .from("products")
    .select("*")
    .in("parent_product_id", parentIds)
    .order("slug");

  if (error) {
    console.error("[products] getChildProductsByParentIds", error);
    return [];
  }
  return (data ?? []).map((r) => mapProductRow(r as ProductRow));
}

export async function getChildProductsWithVariantValues(
  parentId: string
): Promise<Product[]> {
  const children = await getChildProducts(parentId);
  return Promise.all(
    children.map(async (child) => {
      const variantValues = await getProductVariantValues(child.id);
      return { ...child, variantValues };
    })
  );
}

async function getProductVariantValues(productId: string): Promise<ProductVariantValue[]> {
  const { data, error } = await supabaseServer
    .from("product_variant_values")
    .select(
      `
      variant_value_id,
      variant_values(value, variant_types(id, name))
    `
    )
    .eq("product_id", productId);

  if (error) {
    console.error("[products] getProductVariantValues", productId, error);
    return [];
  }

  type Row = {
    variant_value_id: string;
    variant_values: {
      value: string;
      variant_types: { id: string; name: string } | null;
    } | null;
  };

  const rows = (data ?? []) as unknown as Row[];

  return rows
    .filter((r): r is Row & { variant_values: NonNullable<Row["variant_values"]> } => !!r.variant_values)
    .map((r) => ({
      variantTypeId: r.variant_values.variant_types?.id ?? "",
      variantTypeName: r.variant_values.variant_types?.name ?? "",
      valueId: r.variant_value_id,
      value: r.variant_values.value,
    }));
}

export async function createSimpleProduct(data: {
  name: string;
  slug: string;
  description: string;
  price: number;
  category_id?: string | null;
  image_url?: string | null;
  featured?: boolean;
  sku?: string | null;
  stock?: number | null;
}): Promise<{ ok: boolean; id?: string; error?: string }> {
  const { data: row, error } = await supabaseAdmin
    .from("products")
    .insert({
      name: data.name,
      slug: data.slug,
      description: data.description,
      price: data.price,
      category_id: data.category_id ?? null,
      image_url: data.image_url ?? null,
      featured: data.featured ?? false,
      sku: data.sku ?? null,
      stock: data.stock ?? null,
      is_variant: false,
      parent_product_id: null,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[products] createSimpleProduct", error);
    return { ok: false, error: error.message };
  }
  return { ok: true, id: row?.id };
}

export async function createConfigurableProduct(data: {
  name: string;
  slug: string;
  description: string;
  category_id?: string | null;
  image_url?: string | null;
  featured?: boolean;
}): Promise<{ ok: boolean; id?: string; error?: string }> {
  const { data: row, error } = await supabaseAdmin
    .from("products")
    .insert({
      name: data.name,
      slug: data.slug,
      description: data.description,
      price: null,
      category_id: data.category_id ?? null,
      image_url: data.image_url ?? null,
      featured: data.featured ?? false,
      is_variant: false,
      parent_product_id: null,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[products] createConfigurableProduct", error);
    return { ok: false, error: error.message };
  }
  return { ok: true, id: row?.id };
}

type VariantCombination = {
  valueIds: string[];
  valueLabels: string[];
};

export async function createVariantProducts(
  parentProductId: string,
  combinations: VariantCombination[],
  defaultPrice: number | null = null,
  defaultStock: number = 0
): Promise<{ ok: boolean; error?: string }> {
  const parent = await getProductById(parentProductId);
  if (!parent) return { ok: false, error: "Producto padre no encontrado" };

  const { data: existing } = await supabaseAdmin
    .from("products")
    .select("id")
    .eq("parent_product_id", parentProductId);
  const existingIds = (existing ?? []).map((r) => r.id);

  if (existingIds.length > 0) {
    await supabaseAdmin
      .from("product_variant_values")
      .delete()
      .in("product_id", existingIds);
    const { error: deleteErr } = await supabaseAdmin
      .from("products")
      .delete()
      .eq("parent_product_id", parentProductId);
    if (deleteErr) {
      console.error("[products] createVariantProducts delete children", deleteErr);
      return { ok: false, error: deleteErr.message };
    }
  }

  await supabaseAdmin
    .from("products")
    .update({ price: null })
    .eq("id", parentProductId);

  const baseSlug = parent.slug;
  const usedSlugs = new Set<string>();

  for (const comb of combinations) {
    const slug = baseSlug + "-" + comb.valueLabels.map((l) => l.toLowerCase().replace(/\s+/g, "-")).join("-");
    let uniqueSlug = slug;
    let n = 0;
    while (usedSlugs.has(uniqueSlug)) {
      n++;
      uniqueSlug = `${slug}-${n}`;
    }
    usedSlugs.add(uniqueSlug);

    const sku = generateSku(baseSlug, comb.valueLabels);
    const { data: childRow, error: insertErr } = await supabaseAdmin
      .from("products")
      .insert({
        name: parent.name,
        slug: uniqueSlug,
        description: parent.description,
        price: defaultPrice,
        category_id: parent.category_id,
        image_url: parent.image_url,
        featured: false,
        is_variant: true,
        parent_product_id: parentProductId,
        sku,
        stock: defaultStock,
      })
      .select("id")
      .single();

    if (insertErr || !childRow?.id) {
      console.error("[products] createVariantProducts insert child", insertErr);
      return { ok: false, error: insertErr?.message ?? "Error creando hijo" };
    }

    const pvvRows = comb.valueIds.map((variant_value_id) => ({
      product_id: childRow.id,
      variant_value_id,
    }));
    const { error: pvvErr } = await supabaseAdmin
      .from("product_variant_values")
      .insert(pvvRows);
    if (pvvErr) {
      console.error("[products] createVariantProducts insert pvv", pvvErr);
      return { ok: false, error: pvvErr.message };
    }
  }

  return { ok: true };
}

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabaseServer
    .from("products")
    .select("*")
    .or("is_variant.eq.false,is_variant.is.null")
    .order("name");

  if (error || !data) return [];
  const rows = data.filter((r: ProductRow) => !(r as ProductRow).is_variant);
  const products = rows.map((r) => mapProductRow(r as ProductRow));
  return attachVariantsToProducts(products);
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const { data, error } = await supabaseServer
    .from("products")
    .select("*")
    .eq("featured", true)
    .or("is_variant.eq.false,is_variant.is.null")
    .order("name");

  if (error || !data) return [];
  const rows = data.filter((r: ProductRow) => !(r as ProductRow).is_variant);
  const products = rows.map((r) => mapProductRow(r as ProductRow));
  return attachVariantsToProducts(products);
}

export async function getProductsByCategoryId(categoryId: string): Promise<Product[]> {
  const { data, error } = await supabaseServer
    .from("products")
    .select("*")
    .eq("category_id", categoryId)
    .or("is_variant.eq.false,is_variant.is.null")
    .order("name");

  if (error || !data) return [];
  const products = data.map((r) => mapProductRow(r as ProductRow));
  return attachVariantsToProducts(products);
}

export async function getProductsByCategoryIds(categoryIds: string[]): Promise<Product[]> {
  if (categoryIds.length === 0) return [];
  const { data, error } = await supabaseServer
    .from("products")
    .select("*")
    .in("category_id", categoryIds)
    .or("is_variant.eq.false,is_variant.is.null")
    .order("name");

  if (error || !data) return [];
  const products = data.map((r) => mapProductRow(r as ProductRow));
  return attachVariantsToProducts(products);
}

async function attachVariantsToProducts(products: Product[]): Promise<Product[]> {
  const parentIds = products.map((p) => p.id);
  const allChildren = await getChildProductsByParentIds(parentIds);
  const childrenByParentId = new Map<string, Product[]>();
  for (const child of allChildren) {
    const pid = child.parent_product_id ?? "";
    if (!childrenByParentId.has(pid)) childrenByParentId.set(pid, []);
    childrenByParentId.get(pid)!.push(child);
  }
  return products.map((p) => ({
    ...p,
    variants: childrenByParentId.get(p.id) ?? [],
  }));
}
