import { NextResponse } from "next/server";
import { productSchema } from "@/lib/schemas/product";
import { supabaseAdmin } from "@/lib/supabase/admin";

type ProductPayload = {
  id?: string;
  name: string;
  price: number;
  slug: string;
  description: string;
  image_url?: string;
};

export async function POST(request: Request) {
  const payload = (await request.json()) as ProductPayload;
  const parsed = productSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Datos inválidos" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("products")
    .insert({
      name: parsed.data.name,
      price: parsed.data.price,
      slug: parsed.data.slug,
      description: parsed.data.description,
      image_url: payload.image_url ?? null
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

  const { error } = await supabaseAdmin
    .from("products")
    .update({
      name: parsed.data.name,
      price: parsed.data.price,
      slug: parsed.data.slug,
      description: parsed.data.description,
      image_url: payload.image_url ?? undefined
    })
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

