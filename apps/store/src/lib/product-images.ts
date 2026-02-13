import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { ProductImage } from "@/types";

const BUCKET = "product-images";

type ProductImageRow = {
  id: string;
  product_id: string;
  url: string;
  position: number;
  is_primary: boolean;
  created_at: string;
};

function mapRow(row: ProductImageRow): ProductImage {
  return {
    id: row.id,
    product_id: row.product_id,
    url: row.url,
    position: row.position,
    is_primary: row.is_primary,
  };
}

export async function getProductImages(productId: string): Promise<ProductImage[]> {
  const { data, error } = await supabaseServer
    .from("product_images")
    .select("id, product_id, url, position, is_primary, created_at")
    .eq("product_id", productId)
    .order("position", { ascending: true });

  if (error) {
    console.error("[product-images] getProductImages", productId, error);
    return [];
  }
  return (data ?? []).map((r) => mapRow(r as ProductImageRow));
}

export async function addProductImages(
  productId: string,
  urls: string[]
): Promise<{ ok: boolean; images?: ProductImage[]; error?: string }> {
  if (urls.length === 0) return { ok: true, images: [] };

  const { data: existing } = await supabaseAdmin
    .from("product_images")
    .select("position")
    .eq("product_id", productId)
    .order("position", { ascending: false })
    .limit(1);

  const startPosition = existing?.[0]?.position ?? -1;

  const rows = urls.map((url, i) => ({
    product_id: productId,
    url,
    position: startPosition + 1 + i,
    is_primary: false,
  }));

  const { data: inserted, error } = await supabaseAdmin
    .from("product_images")
    .insert(rows)
    .select("id, product_id, url, position, is_primary, created_at");

  if (error) {
    console.error("[product-images] addProductImages", error);
    return { ok: false, error: error.message };
  }

  const images = (inserted ?? []).map((r) => mapRow(r as ProductImageRow));
  return { ok: true, images };
}

export async function setPrimaryImage(
  productId: string,
  imageId: string
): Promise<{ ok: boolean; error?: string }> {
  const { data: image, error: fetchErr } = await supabaseAdmin
    .from("product_images")
    .select("url")
    .eq("id", imageId)
    .eq("product_id", productId)
    .single();

  if (fetchErr || !image) {
    return { ok: false, error: "Imagen no encontrada" };
  }

  await supabaseAdmin
    .from("product_images")
    .update({ is_primary: false })
    .eq("product_id", productId);

  const { error: updateImgErr } = await supabaseAdmin
    .from("product_images")
    .update({ is_primary: true })
    .eq("id", imageId);

  if (updateImgErr) {
    console.error("[product-images] setPrimaryImage", updateImgErr);
    return { ok: false, error: updateImgErr.message };
  }

  const { error: updateProductErr } = await supabaseAdmin
    .from("products")
    .update({ image_url: image.url })
    .eq("id", productId);

  if (updateProductErr) {
    console.error("[product-images] setPrimaryImage update product", updateProductErr);
    return { ok: false, error: updateProductErr.message };
  }

  return { ok: true };
}

export async function reorderImages(
  productId: string,
  ordering: { id: string; position: number }[]
): Promise<{ ok: boolean; error?: string }> {
  for (const { id, position } of ordering) {
    const { error } = await supabaseAdmin
      .from("product_images")
      .update({ position })
      .eq("id", id)
      .eq("product_id", productId);
    if (error) {
      console.error("[product-images] reorderImages", error);
      return { ok: false, error: error.message };
    }
  }
  return { ok: true };
}

function extractStoragePathFromPublicUrl(url: string): string | null {
  try {
    const match = url.match(/\/object\/public\/product-images\/(.+)$/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

export async function deleteProductImage(
  imageId: string
): Promise<{ ok: boolean; error?: string }> {
  const { data: image, error: fetchErr } = await supabaseAdmin
    .from("product_images")
    .select("product_id, url, is_primary")
    .eq("id", imageId)
    .single();

  if (fetchErr || !image) {
    return { ok: false, error: "Imagen no encontrada" };
  }

  const { error: deleteRowErr } = await supabaseAdmin
    .from("product_images")
    .delete()
    .eq("id", imageId);

  if (deleteRowErr) {
    console.error("[product-images] deleteProductImage", deleteRowErr);
    return { ok: false, error: deleteRowErr.message };
  }

  const path = extractStoragePathFromPublicUrl(image.url);
  if (path) {
    await supabaseAdmin.storage.from(BUCKET).remove([path]);
  }

  if (image.is_primary) {
    const { data: remaining } = await supabaseAdmin
      .from("product_images")
      .select("id, url")
      .eq("product_id", image.product_id)
      .order("position", { ascending: true })
      .limit(1);

    const newPrimaryUrl = remaining?.[0]?.url ?? null;

    if (remaining?.[0]?.id) {
      await supabaseAdmin
        .from("product_images")
        .update({ is_primary: true })
        .eq("id", remaining[0].id);
    }

    await supabaseAdmin
      .from("products")
      .update({ image_url: newPrimaryUrl })
      .eq("id", image.product_id);
  }

  return { ok: true };
}
