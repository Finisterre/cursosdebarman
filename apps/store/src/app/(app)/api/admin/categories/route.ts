import { NextResponse } from "next/server";
import { categorySchema } from "@/lib/schemas/category";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createBanner, updateBanner, deleteBanner } from "@/lib/banners";

type CategoryPayload = {
  id?: string;
  name: string;
  slug: string;
  description?: string;
  parent_id?: string | null;
  is_active: boolean;
  banner_image_url?: string;
  meta_title?: string | null;
  meta_description?: string | null;
  meta_keywords?: string | null;
  meta_image?: string | null;
  canonical_url?: string | null;
  no_index?: boolean;
};

function normalizeCategory(payload: CategoryPayload) {
  const description =
    typeof payload.description === "string" && payload.description.trim().length > 0
      ? payload.description.trim()
      : null;
  const parentId =
    typeof payload.parent_id === "string" && payload.parent_id.length > 0
      ? payload.parent_id
      : null;

  return { description, parentId };
}

export async function POST(request: Request) {
  const payload = (await request.json()) as CategoryPayload;
  const parsed = categorySchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Datos inválidos" }, { status: 400 });
  }

  const { description, parentId } = normalizeCategory(parsed.data);

  let bannerId: string | null = null;
  const bannerUrl = (parsed.data.banner_image_url ?? "").trim();
  const isRoot = parentId === null;
  if (isRoot && bannerUrl) {
    const created = await createBanner({
      title: parsed.data.name,
      image_url: bannerUrl,
      position: "category",
      type: "image",
      display_order: 0,
      is_active: true,
    });
    if (created.ok && created.id) bannerId = created.id;
  }

  const { data, error } = await supabaseAdmin
    .from("categories")
    .insert({
      name: parsed.data.name,
      slug: parsed.data.slug,
      description,
      parent_id: parentId,
      is_active: parsed.data.is_active,
      banner_id: bannerId,
      meta_title: (parsed.data.meta_title?.trim() || null) ?? null,
      meta_description: (parsed.data.meta_description?.trim() || null) ?? null,
      meta_keywords: (parsed.data.meta_keywords?.trim() || null) ?? null,
      meta_image: (parsed.data.meta_image?.trim() || null) ?? null,
      canonical_url: (parsed.data.canonical_url?.trim() || null) ?? null,
      no_index: parsed.data.no_index ?? false,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json(
      { ok: false, message: "Error creando categoría", details: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, id: data?.id });
}

export async function PUT(request: Request) {
  const payload = (await request.json()) as CategoryPayload;
  const parsed = categorySchema.safeParse(payload);

  if (!payload.id) {
    return NextResponse.json({ ok: false, message: "Falta id" }, { status: 400 });
  }

  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Datos inválidos" }, { status: 400 });
  }

  if (parsed.data.parent_id && parsed.data.parent_id === payload.id) {
    return NextResponse.json(
      { ok: false, message: "Una categoría no puede ser su propio padre." },
      { status: 400 }
    );
  }

  const { description, parentId } = normalizeCategory(parsed.data);
  const isRoot = parentId === null;
  const bannerUrl = (parsed.data.banner_image_url ?? "").trim();

  const { data: existing } = await supabaseAdmin
    .from("categories")
    .select("banner_id")
    .eq("id", payload.id)
    .single();

  const currentBannerId = (existing as { banner_id: string | null } | null)?.banner_id ?? null;
  let newBannerId: string | null = isRoot ? currentBannerId : null;

  if (isRoot) {
    if (bannerUrl) {
      if (currentBannerId) {
        await updateBanner(currentBannerId, {
          title: parsed.data.name,
          image_url: bannerUrl,
          position: "category",
          type: "image",
          display_order: 0,
          is_active: true,
        });
        newBannerId = currentBannerId;
      } else {
        const created = await createBanner({
          title: parsed.data.name,
          image_url: bannerUrl,
          position: "category",
          type: "image",
          display_order: 0,
          is_active: true,
        });
        if (created.ok && created.id) newBannerId = created.id;
      }
    } else if (currentBannerId) {
      await deleteBanner(currentBannerId);
      newBannerId = null;
    }
  } else if (currentBannerId) {
    await deleteBanner(currentBannerId);
    newBannerId = null;
  }

  const { error } = await supabaseAdmin
    .from("categories")
    .update({
      name: parsed.data.name,
      slug: parsed.data.slug,
      description,
      parent_id: parentId,
      is_active: parsed.data.is_active,
      banner_id: newBannerId,
      meta_title: (parsed.data.meta_title?.trim() || null) ?? null,
      meta_description: (parsed.data.meta_description?.trim() || null) ?? null,
      meta_keywords: (parsed.data.meta_keywords?.trim() || null) ?? null,
      meta_image: (parsed.data.meta_image?.trim() || null) ?? null,
      canonical_url: (parsed.data.canonical_url?.trim() || null) ?? null,
      no_index: parsed.data.no_index ?? false,
    })
    .eq("id", payload.id);

  if (error) {
    return NextResponse.json(
      { ok: false, message: "Error actualizando categoría", details: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}

