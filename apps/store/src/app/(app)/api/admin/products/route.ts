import { NextResponse } from "next/server";
import { productSchema } from "@/lib/schemas/product";
import { supabaseAdmin } from "@/lib/supabase/admin";

type ProductPayload = {
  id?: string;
  name?: string;
  price?: number | null;
  stock?: number | null | string;
  slug?: string;
  description?: string;
  image_url?: string;
  category_id?: string | null;
  featured?: boolean;
  meta_title?: string | null;
  meta_description?: string | null;
  meta_keywords?: string | null;
  meta_image?: string | null;
  canonical_url?: string | null;
  no_index?: boolean;
};

export async function POST(request: Request) {
  const payload = (await request.json()) as ProductPayload;
  const parsed = productSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Datos inválidos" }, { status: 400 });
  }

  const categoryId =
    typeof payload.category_id === "string" && payload.category_id.length > 0
      ? payload.category_id
      : null;

  const { data, error } = await supabaseAdmin
    .from("products")
    .insert({
      name: parsed.data.name,
      price: parsed.data.price ?? null,
      slug: parsed.data.slug,
      description: parsed.data.description,
      image_url: payload.image_url ?? null,
      category_id: categoryId,
      featured: parsed.data.featured ?? false,
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
      { ok: false, message: "Error creando producto", details: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, id: data?.id });
}

export async function PUT(request: Request) {
  const payload = (await request.json()) as ProductPayload;
  const parsed = productSchema.safeParse(payload);

  if (!payload.id) {
    return NextResponse.json({ ok: false, message: "Falta id" }, { status: 400 });
  }

  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Datos inválidos" }, { status: 400 });
  }

  const categoryId =
    typeof payload.category_id === "string" && payload.category_id.length > 0
      ? payload.category_id
      : null;

  const updatePayload: Record<string, unknown> = {
    name: parsed.data.name,
    price: parsed.data.price ?? null,
    slug: parsed.data.slug,
    description: parsed.data.description,
    image_url: payload.image_url ?? undefined,
    category_id: categoryId ?? null,
    featured: parsed.data.featured ?? false,
    meta_title: (parsed.data.meta_title?.trim() || null) ?? null,
    meta_description: (parsed.data.meta_description?.trim() || null) ?? null,
    meta_keywords: (parsed.data.meta_keywords?.trim() || null) ?? null,
    meta_image: (parsed.data.meta_image?.trim() || null) ?? null,
    canonical_url: (parsed.data.canonical_url?.trim() || null) ?? null,
    no_index: parsed.data.no_index ?? false,
  };
  if (payload.stock !== undefined) {
    const raw = payload.stock;
    updatePayload.stock = raw === "" || raw === null ? null : Number(raw);
  }

  const { error } = await supabaseAdmin
    .from("products")
    .update(updatePayload)
    .eq("id", payload.id);

  console.log("Supabase update product", {
    id: payload.id,
    values: parsed.data,
    error
  });

  if (error) {
    return NextResponse.json(
      { ok: false, message: "Error actualizando producto", details: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}

