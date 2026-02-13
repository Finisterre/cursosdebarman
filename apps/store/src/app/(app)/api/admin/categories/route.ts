import { NextResponse } from "next/server";
import { categorySchema } from "@/lib/schemas/category";
import { supabaseAdmin } from "@/lib/supabase/admin";

type CategoryPayload = {
  id?: string;
  name: string;
  slug: string;
  description?: string;
  parent_id?: string | null;
  is_active: boolean;
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

  const { data, error } = await supabaseAdmin
    .from("categories")
    .insert({
      name: parsed.data.name,
      slug: parsed.data.slug,
      description,
      parent_id: parentId,
      is_active: parsed.data.is_active,
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

  const { error } = await supabaseAdmin
    .from("categories")
    .update({
      name: parsed.data.name,
      slug: parsed.data.slug,
      description,
      parent_id: parentId,
      is_active: parsed.data.is_active,
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

